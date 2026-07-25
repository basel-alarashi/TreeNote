export interface Topic {
  id: string;
  canvasId: string;
  title: string;
  x: number;
  y: number;
  emoji: string | null;
  createdAt: string;
}

export interface CreateTopicCommand {
  canvasId: string;
  title: string;
  x: number;
  y: number;
  emoji?: string | null;
  parentId?: string | null;
}

export interface UpdateTopicCommand {
  title: string;
  x: number;
  y: number;
  emoji?: string | null;
}
