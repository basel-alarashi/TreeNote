using TreeNote.Application.Commands;
using TreeNote.Application.DTOs;

namespace TreeNote.Application.Interfaces;

public interface ICanvasService
{
    Task<List<CanvasDto>> GetByWorkspaceAsync(Guid workspaceId, CancellationToken cancellationToken);
    Task<CanvasDetailDto> GetByIdAsync(Guid id, CancellationToken cancellationToken);
    Task<CanvasDto> CreateAsync(CreateCanvasCommand command, CancellationToken cancellationToken);
    Task<CanvasDto> UpdateAsync(Guid id, UpdateCanvasCommand command, CancellationToken cancellationToken);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken);
}
