using System.Text.Json;

namespace TreeNote.Application.DTOs;

public sealed class SyncChangeDto
{
    public string EntityType { get; init; } = string.Empty; // "Topic" | "Relationship"
    public string EntityId { get; init; } = string.Empty;   // Topic: guid string. Relationship: parentId (childId lives in payload).
    public string Operation { get; init; } = string.Empty;  // "Create" | "Update" | "Delete"
    public JsonElement Payload { get; init; }
}
