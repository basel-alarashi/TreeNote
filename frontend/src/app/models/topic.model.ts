export interface Topic {
  id: string;
  canvasId: string;
  title: string;
  x: number;
  y: number;
  emoji?: string | null;
  createdAt: string;
  rowVersion: string; // base64, opaque — just echo it back on updates
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
  rowVersion: string;
}

export interface TopicPositionUpdate {
  id: string;
  x: number;
  y: number;
  rowVersion: string;
}
