namespace TreeNote.Application.Canvases.Commands;

public record CreateCanvasCommand(Guid WorkspaceId, string Name);
