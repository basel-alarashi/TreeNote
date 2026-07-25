namespace TreeNote.Application.DTOs;

// Returns the whole graph for a canvas in one call, so the frontend can render
// the full map without recursive per-node requests.
public record CanvasDetailDto(
    Guid Id,
    Guid WorkspaceId,
    string Name,
    DateTime CreatedAt,
    List<TopicDto> Topics,
    List<RelationshipDto> Relationships);
