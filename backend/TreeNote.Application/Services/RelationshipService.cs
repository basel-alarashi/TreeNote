using Microsoft.EntityFrameworkCore;
using TreeNote.Application.Common.Exceptions;
using TreeNote.Application.Common.Interfaces;
using TreeNote.Application.Relationships.Commands;
using TreeNote.Application.Relationships.DTOs;
using TreeNote.Application.Relationships.Interfaces;
using TreeNote.Domain.Entities;

namespace TreeNote.Application.Relationships.Services;

public class RelationshipService : IRelationshipService
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public RelationshipService(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<RelationshipDto> CreateAsync(CreateRelationshipCommand command)
    {
        if (command.ParentId == command.ChildId)
            throw new BusinessRuleException("A topic cannot be its own parent.");

        var parent = await GetOwnedTopicAsync(command.ParentId);
        var child = await GetOwnedTopicAsync(command.ChildId);

        if (parent.CanvasId != child.CanvasId)
            throw new BusinessRuleException("Relationships must connect topics within the same canvas.");

        var exists = await _context.Relationships
            .AnyAsync(r => r.ParentId == command.ParentId && r.ChildId == command.ChildId);
        if (exists)
            throw new ConflictException("This relationship already exists.");

        if (await WouldCreateCycleAsync(parent.CanvasId, command.ParentId, command.ChildId))
            throw new BusinessRuleException("This relationship would create a cycle.");

        var relationship = new Relationship { ParentId = command.ParentId, ChildId = command.ChildId };
        _context.Relationships.Add(relationship);
        await _context.SaveChangesAsync();

        return new RelationshipDto(relationship.ParentId, relationship.ChildId);
    }

    public async Task DeleteAsync(DeleteRelationshipCommand command)
    {
        // Ownership check via the parent topic is sufficient — both topics are
        // already guaranteed to be in the same (owned) canvas by CreateAsync's rules.
        await GetOwnedTopicAsync(command.ParentId);

        var relationship = await _context.Relationships
            .FirstOrDefaultAsync(r => r.ParentId == command.ParentId && r.ChildId == command.ChildId);

        if (relationship is null)
            throw new NotFoundException("Relationship was not found.");

        _context.Relationships.Remove(relationship);
        await _context.SaveChangesAsync();
    }

    // Adding edge Parent->Child creates a cycle iff Parent is already reachable
    // FROM Child via existing edges (that path + the new edge closes a loop).
    private async Task<bool> WouldCreateCycleAsync(Guid canvasId, Guid parentId, Guid childId)
    {
        var edges = await _context.Relationships
            .Where(r => r.Parent.CanvasId == canvasId)
            .Select(r => new { r.ParentId, r.ChildId })
            .ToListAsync();

        var adjacency = edges
            .GroupBy(e => e.ParentId)
            .ToDictionary(g => g.Key, g => g.Select(e => e.ChildId).ToList());

        var visited = new HashSet<Guid>();
        var queue = new Queue<Guid>();
        queue.Enqueue(childId);

        while (queue.Count > 0)
        {
            var current = queue.Dequeue();
            if (current == parentId) return true;
            if (!visited.Add(current)) continue;

            if (adjacency.TryGetValue(current, out var next))
            {
                foreach (var n in next) queue.Enqueue(n);
            }
        }

        return false;
    }

    private async Task<Topic> GetOwnedTopicAsync(Guid id)
    {
        var topic = await _context.Topics
            .Include(t => t.Canvas)
            .ThenInclude(c => c.Workspace)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (topic is null) throw new NotFoundException($"Topic '{id}' was not found.");
        if (topic.Canvas.Workspace.UserId != _currentUser.UserId) throw new ForbiddenAccessException();
        return topic;
    }
}
