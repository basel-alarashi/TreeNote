namespace TreeNote.Application.DTOs;

/// <summary>
/// Result item returned by GET /api/v1/search/topics.
/// Matches the response shape suggested in the Sprint 5 API spec.
/// </summary>
public sealed class SearchTopicDto
{
    public Guid TopicId { get; init; }

    public Guid CanvasId { get; init; }

    public string CanvasName { get; init; } = string.Empty;

    public string Title { get; init; } = string.Empty;

    public string? Emoji { get; init; }
}
