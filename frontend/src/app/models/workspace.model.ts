export interface Workspace {
  id: string;
  name: string;
  createdAt: string;
}

export interface CreateWorkspaceCommand {
  name: string;
}

export interface UpdateWorkspaceCommand {
  name: string;
}
