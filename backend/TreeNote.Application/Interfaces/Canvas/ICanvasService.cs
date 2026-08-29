using TreeNote.Application.Commands;
using TreeNote.Application.DTOs;

namespace TreeNote.Application.Interfaces;

public interface ICanvasService
{
    Task<List<CanvasDto>> GetByWorkspaceAsync(Guid workspaceId);
    Task<CanvasDetailDto> GetByIdAsync(Guid id);
    Task<CanvasDto> CreateAsync(CreateCanvasCommand command);
    Task<CanvasDto> UpdateAsync(Guid id, UpdateCanvasCommand command);
    Task DeleteAsync(Guid id);
}
