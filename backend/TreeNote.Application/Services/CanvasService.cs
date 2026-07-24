using Microsoft.EntityFrameworkCore;
using TreeNote.Application.Commands;
using TreeNote.Application.DTOs;
using TreeNote.Application.Interfaces;
using TreeNote.Application.Exceptions;
using TreeNote.Domain.Entities;

namespace TreeNote.Application.Services;

public class CanvasService : ICanvasService
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly IRelationshipCleanupService _relationshipCleanup;

    public CanvasService(
        IApplicationDbContext context,
        ICurrentUserService currentUser,
        IRelationshipCleanupService relationshipCleanup)
    {
        _context = context;
        _currentUser = currentUser;
        _relationshipCleanup = relationshipCleanup;
    }

    public async Task<List<CanvasDto>> GetByWorkspaceAsync(Guid workspaceId)
    {
        await EnsureWorkspaceOwnedAsync(workspaceId);

        return await _context
            .Where(c => c.WorkspaceId == workspaceId)
            .OrderBy(c => c.CreatedAt)
            .Select(c => new CanvasDto(c.Id, c.WorkspaceId, c.Name, c.CreatedAt))
            .ToListAsync();
    }

    public async Task<CanvasDetailDto> GetByIdAsync(Guid id)
    {
        var canvas = await GetOwnedCanvasAsync(id);

        var topics = await _context.Topics
            .Where(t => t.CanvasId == id)
            .Select(t => new TopicDto(t.Id, t.CanvasId, t.Title, t.X, t.Y, t.Emoji, t.CreatedAt))
            .ToListAsync();

        var relationships = await _context.Relationships
            .Where(r => r.Parent.CanvasId == id)
            .Select(r => new RelationshipDto(r.ParentId, r.ChildId))
            .ToListAsync();

        return new CanvasDetailDto(canvas.Id, canvas.WorkspaceId, canvas.Name, canvas.CreatedAt, topics, relationships);
    }

    public async Task<CanvasDto> CreateAsync(CreateCanvasCommand command)
    {
        await EnsureWorkspaceOwnedAsync(command.WorkspaceId);

        var canvas = new Canvas
        {
            Id = Guid.NewGuid(),
            WorkspaceId = command.WorkspaceId,
            Name = command.Name,
        };

        _context.Add(canvas);
        await _context.SaveChangesAsync();

        return new CanvasDto(canvas.Id, canvas.WorkspaceId, canvas.Name, canvas.CreatedAt);
    }

    public async Task<CanvasDto> UpdateAsync(Guid id, UpdateCanvasCommand command)
    {
        var canvas = await GetOwnedCanvasAsync(id);
        canvas.Name = command.Name;
        await _context.SaveChangesAsync();
        return new CanvasDto(canvas.Id, canvas.WorkspaceId, canvas.Name, canvas.CreatedAt);
    }

    public async Task DeleteAsync(Guid id)
    {
        var canvas = await GetOwnedCanvasAsync(id);

        var topicIds = await _context.Topics
            .Where(t => t.CanvasId == id)
            .Select(t => t.Id)
            .ToListAsync();

        await _relationshipCleanup.RemoveRelationshipsForTopicsAsync(topicIds);

        _context.Remove(canvas); // cascades to Topics
        await _context.SaveChangesAsync();
    }

    private async Task EnsureWorkspaceOwnedAsync(Guid workspaceId)
    {
        var workspace = await _context.Workspaces.FirstOrDefaultAsync(w => w.Id == workspaceId);
        if (workspace is null) throw new NotFoundException($"Workspace '{workspaceId}' was not found.");
        if (workspace.UserId != _currentUser.UserId) throw new ForbiddenAccessException();
    }

    private async Task<Canvas> GetOwnedCanvasAsync(Guid id)
    {
        var canvas = await _context
            .Include(c => c.Workspace)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (canvas is null) throw new NotFoundException($"Canvas '{id}' was not found.");
        if (canvas.Workspace.UserId != _currentUser.UserId) throw new ForbiddenAccessException();
        return canvas;
    }
}
