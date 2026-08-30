namespace TreeNote.Application.DTOs;

/// <summary>
/// Flat, cycle-free projection of a Topic for sync responses.
/// Deliberately excludes navigation properties (Canvas, IncomingRelationships,
/// OutgoingRelationships) — returning the entity itself causes a reference
/// cycle in System.Text.Json via Topic -> Relationship -> Topic.
/// </summary>
public sealed class TopicSyncDto
{
    public Guid Id { get; init; }
    public Guid CanvasId { get; init; }
    public string Title { get; init; } = string.Empty;
    public double X { get; init; }
    public double Y { get; init; }
    public string? Emoji { get; init; }
    public DateTime CreatedAt { get; init; }

    /// <summary>Base64-encoded RowVersion, so the client can echo it back on the next Update for optimistic concurrency.</summary>
    public string RowVersion { get; init; } = string.Empty;
}
