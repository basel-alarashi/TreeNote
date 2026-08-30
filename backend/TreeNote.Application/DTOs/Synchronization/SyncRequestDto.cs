namespace TreeNote.Application.DTOs;

public sealed class SyncRequestDto
{
    public List<SyncChangeDto> Changes { get; init; } = new();
}
