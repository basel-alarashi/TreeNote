namespace TreeNote.Application.DTOs;

public sealed class SyncChangeResultDto
{
    public string EntityId { get; init; } = string.Empty;
    public string EntityType { get; init; } = string.Empty;
    public string Operation { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty; // "Success" | "Failed" | "Conflict"
    public string? Message { get; init; }
    public object? UpdatedEntity { get; init; }
}

public sealed class SyncResponseDto
{
    public List<SyncChangeResultDto> Results { get; init; } = new();
}
