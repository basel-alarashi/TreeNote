using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using TreeNote.Application.Interfaces;
using TreeNote.Application.DTOs;
using TreeNote.Domain.Entities;

namespace TreeNote.Application.Services;

public sealed class SyncService : ISyncService
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public SyncService(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<SyncResponseDto> ProcessChangesAsync(SyncRequestDto request, CancellationToken cancellationToken = default)
    {
        var response = new SyncResponseDto();
        var userId = _currentUserService.UserId;

        foreach (var change in request.Changes)
        {
            response.Results.Add(await ProcessSingleChangeAsync(change, userId, cancellationToken));
        }

        return response;
    }

    private async Task<SyncChangeResultDto> ProcessSingleChangeAsync(SyncChangeDto change, Guid userId, CancellationToken cancellationToken)
    {
        try
        {
            return change.EntityType switch
            {
                "Topic" => await ProcessTopicChangeAsync(change, userId, cancellationToken),
                "Relationship" => await ProcessRelationshipChangeAsync(change, userId, cancellationToken),
                _ => Failed(change, $"Unknown entity type '{change.EntityType}'.")
            };
        }
        catch (DbUpdateConcurrencyException)
        {
            return await ConflictAsync(change, cancellationToken);
        }
    }

    private async Task<SyncChangeResultDto> ProcessTopicChangeAsync(SyncChangeDto change, Guid userId, CancellationToken cancellationToken)
    {
        switch (change.Operation)
        {
            case "Create":
                {
                    var id = Guid.Parse(change.EntityId);

                    // Idempotency: a retried Create the client already applied should succeed silently, not duplicate or error.
                    if (await _context.Topics.AsNoTracking().AnyAsync(t => t.Id == id, cancellationToken))
                    {
                        return Success(change);
                    }

                    var canvasId = change.Payload.GetProperty("canvasId").GetGuid();
                    var canvasOwned = await _context.Canvases.AsNoTracking()
                        .AnyAsync(c => c.Id == canvasId && c.Workspace.UserId == userId, cancellationToken);
                    if (!canvasOwned)
                    {
                        return Failed(change, "Canvas not found or not owned by the current user.");
                    }

                    var topic = new Topic
                    {
                        Id = id,
                        CanvasId = canvasId,
                        Title = change.Payload.GetProperty("title").GetString() ?? string.Empty,
                        X = change.Payload.GetProperty("x").GetDouble(),
                        Y = change.Payload.GetProperty("y").GetDouble(),
                        Emoji = change.Payload.TryGetProperty("emoji", out var emojiEl) && emojiEl.ValueKind != JsonValueKind.Null
                            ? emojiEl.GetString()
                            : null,
                        CreatedAt = DateTime.UtcNow
                    };

                    _context.Topics.Add(topic);
                    await _context.SaveChangesAsync(cancellationToken);
                    return Success(change, topic);
                }

            case "Update":
                {
                    var id = Guid.Parse(change.EntityId);
                    var topic = await _context.Topics.FirstOrDefaultAsync(t => t.Id == id && t.Canvas.Workspace.UserId == userId, cancellationToken);
                    if (topic is null)
                    {
                        return Failed(change, "Topic not found or not owned by the current user.");
                    }

                    if (change.Payload.TryGetProperty("title", out var titleEl)) topic.Title = titleEl.GetString() ?? topic.Title;
                    if (change.Payload.TryGetProperty("x", out var xEl)) topic.X = xEl.GetDouble();
                    if (change.Payload.TryGetProperty("y", out var yEl)) topic.Y = yEl.GetDouble();
                    if (change.Payload.TryGetProperty("emoji", out var emojiUpdateEl))
                    {
                        topic.Emoji = emojiUpdateEl.ValueKind == JsonValueKind.Null ? null : emojiUpdateEl.GetString();
                    }

                    // Relies on Topic.RowVersion as an EF concurrency token (added Sprint 3) to throw
                    // DbUpdateConcurrencyException on a stale write, caught by the wrapper above.
                    await _context.SaveChangesAsync(cancellationToken);
                    return Success(change, topic);
                }

            case "Delete":
                {
                    var id = Guid.Parse(change.EntityId);
                    var topic = await _context.Topics.FirstOrDefaultAsync(t => t.Id == id && t.Canvas.Workspace.UserId == userId, cancellationToken);
                    if (topic is null)
                    {
                        return Success(change); // already gone — idempotent, not a failure
                    }

                    var relationships = await _context.Relationships
                        .Where(r => r.ParentId == id || r.ChildId == id)
                        .ToListAsync(cancellationToken);
                    _context.Relationships.RemoveRange(relationships);
                    _context.Topics.Remove(topic);
                    await _context.SaveChangesAsync(cancellationToken);
                    return Success(change);
                }

            default:
                return Failed(change, $"Unknown operation '{change.Operation}' for Topic.");
        }
    }

    private async Task<SyncChangeResultDto> ProcessRelationshipChangeAsync(SyncChangeDto change, Guid userId, CancellationToken cancellationToken)
    {
        var parentId = change.Payload.GetProperty("parentId").GetGuid();
        var childId = change.Payload.GetProperty("childId").GetGuid();

        switch (change.Operation)
        {
            case "Create":
                {
                    if (await _context.Relationships.AsNoTracking().AnyAsync(r => r.ParentId == parentId && r.ChildId == childId, cancellationToken))
                    {
                        return Success(change); // idempotent retry
                    }
                    if (parentId == childId)
                    {
                        return Failed(change, "A topic cannot be its own parent.");
                    }

                    var topics = await _context.Topics.AsNoTracking()
                        .Where(t => (t.Id == parentId || t.Id == childId) && t.Canvas.Workspace.UserId == userId)
                        .ToListAsync(cancellationToken);
                    if (topics.Count != 2)
                    {
                        return Failed(change, "One or both topics not found or not owned by the current user.");
                    }
                    if (topics[0].CanvasId != topics[1].CanvasId)
                    {
                        return Failed(change, "Cannot connect topics from different canvases.");
                    }
                    if (await WouldCreateCycleAsync(parentId, childId, cancellationToken))
                    {
                        return Failed(change, "This relationship would create a cycle.");
                    }

                    _context.Relationships.Add(new Relationship { ParentId = parentId, ChildId = childId });
                    await _context.SaveChangesAsync(cancellationToken);
                    return Success(change);
                }

            case "Delete":
                {
                    var relationship = await _context.Relationships.FirstOrDefaultAsync(
                        r => r.ParentId == parentId && r.ChildId == childId, cancellationToken);
                    if (relationship is null)
                    {
                        return Success(change); // already gone — idempotent
                    }

                    _context.Relationships.Remove(relationship);
                    await _context.SaveChangesAsync(cancellationToken);
                    return Success(change);
                }

            default:
                return Failed(change, $"Unknown operation '{change.Operation}' for Relationship.");
        }
    }

    /// Duplicates RelationshipService's cycle check (BR-005) here since sync bypasses that service — see the class-level assumption note.
    private async Task<bool> WouldCreateCycleAsync(Guid parentId, Guid childId, CancellationToken cancellationToken)
    {
        var all = await _context.Relationships.AsNoTracking().ToListAsync(cancellationToken);
        var visited = new HashSet<Guid>();
        var stack = new Stack<Guid>();
        stack.Push(childId);

        while (stack.Count > 0)
        {
            var current = stack.Pop();
            if (current == parentId) return true;
            if (!visited.Add(current)) continue;
            foreach (var rel in all.Where(r => r.ParentId == current)) stack.Push(rel.ChildId);
        }

        return false;
    }

    private async Task<SyncChangeResultDto> ConflictAsync(SyncChangeDto change, CancellationToken cancellationToken)
    {
        object? latest = null;
        if (change.EntityType == "Topic" && Guid.TryParse(change.EntityId, out var id))
        {
            latest = await _context.Topics.AsNoTracking().FirstOrDefaultAsync(t => t.Id == id, cancellationToken);
        }

        return new SyncChangeResultDto
        {
            EntityId = change.EntityId,
            EntityType = change.EntityType,
            Operation = change.Operation,
            Status = "Conflict",
            Message = "This item was changed elsewhere since your last sync.",
            UpdatedEntity = latest
        };
    }

    private static SyncChangeResultDto Success(SyncChangeDto c, object? updated = null) => new()
    { EntityId = c.EntityId, EntityType = c.EntityType, Operation = c.Operation, Status = "Success", UpdatedEntity = updated };

    private static SyncChangeResultDto Failed(SyncChangeDto c, string message) => new()
    { EntityId = c.EntityId, EntityType = c.EntityType, Operation = c.Operation, Status = "Failed", Message = message };
}
