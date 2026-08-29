import { Injectable, inject } from '@angular/core';
import { OfflineDbService } from './offline-db.service';
import { STORE_RELATIONSHIPS, STORE_TOPICS } from '../../models/offline/offline-db.constants';
import { PendingChangesService } from './pending-changes.service';
import { OfflineRelationship, OfflineTopic } from '../../models/offline/offline-canvas.model';
import { Topic, TopicPositionUpdate } from '../../models/topic.model';
import { Relationship } from '../../models/relationship.model';

export interface CreateTopicOfflineInput {
  canvasId: string;
  title: string;
  x: number;
  y: number;
  emoji?: string | null;
  parentId?: string | null;
}

/**
 * The single write path for editing a canvas while offline. Every method
 * here (a) applies the change to the local cache immediately, so the UI
 * reflects it right away (optimistic), and (b) enqueues a matching
 * PendingChange for Stage F's SyncService to replay once back online.
 */
@Injectable({ providedIn: 'root' })
export class OfflineEditingService {
  private readonly db = inject(OfflineDbService);
  private readonly pendingChanges = inject(PendingChangesService);

  async createTopicOffline(input: CreateTopicOfflineInput): Promise<OfflineTopic> {
    const topic: OfflineTopic = {
      id: crypto.randomUUID(), // client-generated id; matches server's guid PK shape, gets reused as-is on sync per FR-005/API spec
      canvasId: input.canvasId,
      title: input.title,
      x: input.x,
      y: input.y,
      createdAt: new Date().toISOString(),
      rowVersion: '',
      emoji: input.emoji
    };

    await this.db.put(STORE_TOPICS, topic);
    await this.pendingChanges.enqueue('Topic', topic.id, input.canvasId, 'Create', {
      id: topic.id,
      canvasId: topic.canvasId,
      title: topic.title,
      x: topic.x,
      y: topic.y,
      emoji: topic.emoji
    });

    if (input.parentId) {
      await this.createRelationshipOffline(input.parentId, topic.id, input.canvasId);
    }

    return topic;
  }

  /** Covers rename + repositioning, matching PUT /topics/{id} semantics from the API spec. */
  async updateTopicOffline(topicId: string, canvasId: string, changes: Partial<Pick<OfflineTopic, 'title' | 'x' | 'y' | 'emoji'>>): Promise<void> {
    const existing = await this.db.get<OfflineTopic>(STORE_TOPICS, topicId);
    if (!existing) return;

    const updated: OfflineTopic = { ...existing, ...changes };
    await this.db.put(STORE_TOPICS, updated);
    await this.pendingChanges.enqueue('Topic', topicId, canvasId, 'Update', changes);
  }

  /**
   * TopicService.update()/delete() only receive a topic id, not its canvasId —
   * these resolve it from the local cache first (the topic must already be
   * cached to be editable offline in the first place).
   */
  async updateTopicOfflineByLookup(
    topicId: string,
    changes: Partial<Pick<OfflineTopic, 'title' | 'x' | 'y' | 'emoji'>>
  ): Promise<Topic | null> {
    const existing = await this.db.get<OfflineTopic>(STORE_TOPICS, topicId);
    if (!existing) return null;

    await this.updateTopicOffline(topicId, existing.canvasId, changes);
    return { ...existing, ...changes } as unknown as Topic;
  }

  /** Dedicated method for drag-driven moves, so the drag path stays cheap and distinguishable from a rename in the queue if you want to debounce/coalesce later. */
  async moveTopicOffline(topicId: string, canvasId: string, x: number, y: number): Promise<void> {
    await this.updateTopicOffline(topicId, canvasId, { x, y });
  }

  /**
   * PUT /topics/positions sends a flat array with no canvasId per item, so
   * canvasId is resolved per-topic from the local cache instead.
   */
  async movePositionsOffline(positions: TopicPositionUpdate[]): Promise<Topic[]> {
    const updated: Topic[] = [];

    for (const position of positions) {
      const existing = await this.db.get<OfflineTopic>(STORE_TOPICS, position.id);
      if (!existing) continue;

      await this.moveTopicOffline(position.id, existing.canvasId, position.x, position.y);
      updated.push({ ...existing, x: position.x, y: position.y } as unknown as Topic);
    }

    return updated;
  }

  async deleteTopicOffline(topicId: string, canvasId: string): Promise<void> {
    const relationships = await this.db.getAllByIndex<OfflineRelationship>(STORE_RELATIONSHIPS, 'byCanvasId', canvasId);
    const affected = relationships.filter((r) => r.parentId === topicId || r.childId === topicId);

    // Mirrors the server's DELETE /topics/{id} behavior: also removes any
    // Relationships referencing this topic, matching IRelationshipCleanupService.
    for (const relationship of affected) {
      await this.db.delete(STORE_RELATIONSHIPS, relationship.id);
    }

    await this.db.delete(STORE_TOPICS, topicId);
    await this.pendingChanges.enqueue('Topic', topicId, canvasId, 'Delete', {});
  }

  async deleteTopicOfflineByLookup(topicId: string): Promise<void> {
    const existing = await this.db.get<OfflineTopic>(STORE_TOPICS, topicId);
    if (!existing) return;
    await this.deleteTopicOffline(topicId, existing.canvasId);
  }

  async createRelationshipOffline(parentId: string, childId: string, canvasId: string): Promise<OfflineRelationship | null> {
    if (parentId === childId) return null; // BR: a topic cannot be its own parent

    const wouldCycle = await this.wouldCreateCycle(parentId, childId, canvasId);
    if (wouldCycle) return null; // BR-005; server re-validates on sync regardless

    const relationship: OfflineRelationship = { id: `${parentId}::${childId}`, parentId, childId, canvasId };
    await this.db.put(STORE_RELATIONSHIPS, relationship);
    await this.pendingChanges.enqueue('Relationship', relationship.id, canvasId, 'Create', { parentId, childId });
    return relationship;
  }

  async deleteRelationshipOffline(parentId: string, childId: string, canvasId: string): Promise<void> {
    const id = `${parentId}::${childId}`;
    await this.db.delete(STORE_RELATIONSHIPS, id);
    await this.pendingChanges.enqueue('Relationship', id, canvasId, 'Delete', { parentId, childId });
  }

  /**
   * RelationshipService.create()/delete() only receive parentId/childId — the
   * canvasId is resolved from the parent topic (both topics must share a
   * canvas per BR: "different canvases" is rejected server-side too).
   */
  async createRelationshipOfflineByLookup(parentId: string, childId: string): Promise<Relationship | null> {
    const parentTopic = await this.db.get<OfflineTopic>(STORE_TOPICS, parentId);
    if (!parentTopic) return null;

    const relationship = await this.createRelationshipOffline(parentId, childId, parentTopic.canvasId);
    return relationship as unknown as Relationship | null;
  }

  async deleteRelationshipOfflineByLookup(parentId: string, childId: string): Promise<void> {
    const parentTopic = await this.db.get<OfflineTopic>(STORE_TOPICS, parentId);
    const canvasId = parentTopic?.canvasId;
    if (!canvasId) return;

    await this.deleteRelationshipOffline(parentId, childId, canvasId);
  }

  /** Lightweight client-side guard only — the server remains the source of truth on sync (Security Requirements: never trust local authorization/validation as final). */
  private async wouldCreateCycle(parentId: string, childId: string, canvasId: string): Promise<boolean> {
    const relationships = await this.db.getAllByIndex<OfflineRelationship>(STORE_RELATIONSHIPS, 'byCanvasId', canvasId);
    const visited = new Set<string>();
    const stack = [childId];

    while (stack.length > 0) {
      const current = stack.pop()!;
      if (current === parentId) return true;
      if (visited.has(current)) continue;
      visited.add(current);

      relationships.filter((r) => r.parentId === current).forEach((r) => stack.push(r.childId));
    }

    return false;
  }
}
