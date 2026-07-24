using TreeNote.Application.Topics.DTOs;
using TreeNote.Application.Relationships.DTOs;

namespace TreeNote.Application.Canvases.DTOs;

// Returns the whole graph for a canvas in one call, so the frontend can render
// the full map without recursive per-node requests.
public record CanvasDetailDto(
    Guid Id,
    Guid WorkspaceId,
    string Name,
    DateTime CreatedAt,
    List<TopicDto> Topics,
    List<RelationshipDto> Relationships);
