import { Injectable, computed, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SelectionService {
  private readonly selectedIds = signal<Set<string>>(new Set());

  readonly selected = computed(() => this.selectedIds());

  isSelected(id: string): boolean {
    return this.selectedIds().has(id);
  }

  select(id: string, additive: boolean): void {
    if (additive) {
      const next = new Set(this.selectedIds());
      next.has(id) ? next.delete(id) : next.add(id);
      this.selectedIds.set(next);
    } else {
      this.selectedIds.set(new Set([id]));
    }
  }

  selectMany(ids: string[]): void {
    this.selectedIds.set(new Set(ids));
  }

  clear(): void {
    this.selectedIds.set(new Set());
  }

  get ids(): string[] {
    return Array.from(this.selectedIds());
  }
}
