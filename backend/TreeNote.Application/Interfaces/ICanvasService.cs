using TreeNote.Application.Canvases.Commands;
using TreeNote.Application.Canvases.DTOs;

namespace TreeNote.Application.Canvases.Interfaces;

public interface ICanvasService
{
    Task<List<CanvasDto>> GetByWorkspaceAsync(Guid workspaceId);
    Task<CanvasDetailDto> GetByIdAsync(Guid id);
    Task<CanvasDto> CreateAsync(CreateCanvasCommand command);
    Task<CanvasDto> UpdateAsync(Guid id, UpdateCanvasCommand command);
    Task DeleteAsync(Guid id);
}
