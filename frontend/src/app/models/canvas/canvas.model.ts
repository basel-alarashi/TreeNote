import { Topic } from '../topic.model';
import { Relationship } from '../relationship.model';

export interface Canvas {
  id: string;
  workspaceId: string;
  name: string;
  createdAt: string;
}

export interface CanvasDetail extends Canvas {
  topics: Topic[];
  relationships: Relationship[];
}

export interface CreateCanvasCommand {
  workspaceId: string;
  name: string;
}

export interface UpdateCanvasCommand {
  name: string;
}
