using Microsoft.EntityFrameworkCore;
using TreeNote.Application.Exceptions;
using TreeNote.Application.Commands;
using TreeNote.Application.DTOs;
using TreeNote.Application.Interfaces;
using TreeNote.Domain.Entities;

namespace TreeNote.Application.Services;

public class WorkspaceService : IWorkspaceService
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly IRelationshipCleanupService _relationshipCleanup;

    public WorkspaceService(
        IApplicationDbContext context,
        ICurrentUserService currentUser,
        IRelationshipCleanupService relationshipCleanup)
    {
        _context = context;
        _currentUser = currentUser;
        _relationshipCleanup = relationshipCleanup;
    }

    public async Task<List<WorkspaceDto>> GetAllForCurrentUserAsync()
    {
        return await _context.Workspaces
            .Where(w => w.UserId == _currentUser.UserId)
            .OrderBy(w => w.CreatedAt)
            .Select(w => new WorkspaceDto(w.Id, w.Name, w.CreatedAt))
            .ToListAsync();
    }

    public async Task<WorkspaceDto> GetByIdAsync(Guid id)
    {
        var workspace = await GetOwnedWorkspaceAsync(id);
        return new WorkspaceDto(workspace.Id, workspace.Name, workspace.CreatedAt);
    }

    public async Task<WorkspaceDto> CreateAsync(CreateWorkspaceCommand command)
    {
        var workspace = new Workspace
        {
            Id = Guid.NewGuid(),
            UserId = _currentUser.UserId,
            Name = command.Name,
        };

        _context.Workspaces.Add(workspace);
        await _context.SaveChangesAsync();

        return new WorkspaceDto(workspace.Id, workspace.Name, workspace.CreatedAt);
    }

    public async Task<WorkspaceDto> UpdateAsync(Guid id, UpdateWorkspaceCommand command)
    {
        var workspace = await GetOwnedWorkspaceAsync(id);
        workspace.Name = command.Name;
        await _context.SaveChangesAsync();
        return new WorkspaceDto(workspace.Id, workspace.Name, workspace.CreatedAt);
    }

    public async Task DeleteAsync(Guid id)
    {
        var workspace = await GetOwnedWorkspaceAsync(id);

        var topicIds = await _context.Topics
            .Where(t => t.Canvas.WorkspaceId == id)
            .Select(t => t.Id)
            .ToListAsync();

        await _relationshipCleanup.RemoveRelationshipsForTopicsAsync(topicIds);

        _context.Workspaces.Remove(workspace); // cascades to Canvases -> Topics
        await _context.SaveChangesAsync();
    }

    private async Task<Workspace> GetOwnedWorkspaceAsync(Guid id)
    {
        var workspace = await _context.Workspaces.FirstOrDefaultAsync(w => w.Id == id);
        if (workspace is null) throw new NotFoundException($"Workspace '{id}' was not found.");
        if (workspace.UserId != _currentUser.UserId) throw new ForbiddenAccessException();
        return workspace;
    }
}
