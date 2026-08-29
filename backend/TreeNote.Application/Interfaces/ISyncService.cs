using TreeNote.Application.DTOs;

namespace TreeNote.Application.Interfaces;

public interface ISyncService
{
    /// Processes changes strictly in request order (client sorts by createdAt before sending),
    /// so a Topic Create is applied before a Relationship that references it.
    Task<SyncResponseDto> ProcessChangesAsync(SyncRequestDto request, CancellationToken cancellationToken = default);
}
