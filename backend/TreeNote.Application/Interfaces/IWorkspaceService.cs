using TreeNote.Application.Commands;
using TreeNote.Application.DTOs;

namespace TreeNote.Application.Interfaces;

public interface IWorkspaceService
{
    Task<List<WorkspaceDto>> GetAllForCurrentUserAsync(CancellationToken cancellationToken = default);
    Task<WorkspaceDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<WorkspaceDto> CreateAsync(CreateWorkspaceCommand command, CancellationToken cancellationToken = default);
    Task<WorkspaceDto> UpdateAsync(Guid id, UpdateWorkspaceCommand command, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
