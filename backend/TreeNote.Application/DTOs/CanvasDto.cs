namespace TreeNote.Application.DTOs;

public record CanvasDto(Guid Id, Guid WorkspaceId, string Name, DateTime CreatedAt);
