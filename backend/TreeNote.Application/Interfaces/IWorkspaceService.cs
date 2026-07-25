using TreeNote.Application.Commands;
using TreeNote.Application.DTOs;

namespace TreeNote.Application.Interfaces;

public interface IWorkspaceService
{
    Task<List<WorkspaceDto>> GetAllForCurrentUserAsync();
    Task<WorkspaceDto> GetByIdAsync(Guid id);
    Task<WorkspaceDto> CreateAsync(CreateWorkspaceCommand command);
    Task<WorkspaceDto> UpdateAsync(Guid id, UpdateWorkspaceCommand command);
    Task DeleteAsync(Guid id);
}
