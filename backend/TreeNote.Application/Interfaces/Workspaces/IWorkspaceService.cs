using TreeNote.Application.Workspaces.Commands;
using TreeNote.Application.Workspaces.DTOs;

namespace TreeNote.Application.Workspaces.Interfaces;

public interface IWorkspaceService
{
    Task<List<WorkspaceDto>> GetAllForCurrentUserAsync();
    Task<WorkspaceDto> GetByIdAsync(Guid id);
    Task<WorkspaceDto> CreateAsync(CreateWorkspaceCommand command);
    Task<WorkspaceDto> UpdateAsync(Guid id, UpdateWorkspaceCommand command);
    Task DeleteAsync(Guid id);
}
