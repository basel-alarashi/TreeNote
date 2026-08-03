using Microsoft.EntityFrameworkCore;
using TreeNote.Application.Exceptions;
using TreeNote.Application.Commands;
using TreeNote.Application.DTOs;
using TreeNote.Application.Interfaces;
using TreeNote.Domain.Entities;

namespace TreeNote.Application.Services;

public class TopicService : ITopicService
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly IRelationshipCleanupService _relationshipCleanup;

    public TopicService(
        IApplicationDbContext context,
        ICurrentUserService currentUser,
        IRelationshipCleanupService relationshipCleanup)
    {
        _context = context;
        _currentUser = currentUser;
        _relationshipCleanup = relationshipCleanup;
    }

    public async Task<TopicDto> GetByIdAsync(Guid id)
    {
        var topic = await GetTrackedOwnedTopicAsync(id);
        return ToDto(topic);
    }

    public async Task<TopicDto> CreateAsync(CreateTopicCommand command)
    {
        var canvas = await _context.Canvases
            .Include(c => c.Workspace)
            .FirstOrDefaultAsync(c => c.Id == command.CanvasId);

        if (canvas is null) throw new NotFoundException($"Canvas '{command.CanvasId}' was not found.");
        if (canvas.Workspace.UserId != _currentUser.UserId) throw new ForbiddenAccessException();

        var topic = new Topic
        {
            Id = Guid.NewGuid(),
            CanvasId = command.CanvasId,
            Title = command.Title,
            X = command.X,
            Y = command.Y,
            Emoji = command.Emoji,
        };
        _context.Topics.Add(topic);

        if (command.ParentId is { } parentId)
        {
            var parent = await _context.Topics.FirstOrDefaultAsync(t => t.Id == parentId);
            if (parent is null) throw new NotFoundException($"Parent topic '{parentId}' was not found.");
            if (parent.CanvasId != command.CanvasId)
                throw new BusinessRuleException("Parent topic must belong to the same canvas.");

            _context.Relationships.Add(new Relationship { ParentId = parentId, ChildId = topic.Id });
        }

        await _context.SaveChangesAsync();
        return ToDto(topic);
    }

    public async Task<TopicDto> UpdateAsync(Guid id, UpdateTopicCommand command)
    {
        var topic = await GetTrackedOwnedTopicAsync(id);

        _context.Entry(topic).Property(t => t.RowVersion).OriginalValue = command.RowVersion;

        topic.Title = command.Title;
        topic.X = command.X;
        topic.Y = command.Y;
        topic.Emoji = command.Emoji;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            throw new ConflictException($"Topic '{id}' was modified by another request. Reload and try again.");
        }

        return ToDto(topic);
    }

    public async Task<List<TopicDto>> UpdatePositionsAsync(UpdateTopicPositionsCommand command)
    {
        var ids = command.Positions.Select(p => p.Id).ToList();

        var topics = await _context.Topics
            .Include(t => t.Canvas).ThenInclude(c => c.Workspace)
            .AsTracking()
            .Where(t => ids.Contains(t.Id))
            .ToListAsync();

        if (topics.Count != ids.Count)
            throw new NotFoundException("One or more topics were not found.");

        foreach (var topic in topics)
        {
            if (topic.Canvas.Workspace.UserId != _currentUser.UserId)
                throw new ForbiddenAccessException();
        }

        foreach (var update in command.Positions)
        {
            var topic = topics.First(t => t.Id == update.Id);
            _context.Entry(topic).Property(t => t.RowVersion).OriginalValue = update.RowVersion;
            topic.X = update.X;
            topic.Y = update.Y;
        }

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            throw new ConflictException("One or more topics were modified by another request. Reload and try again.");
        }

        return topics.Select(ToDto).ToList();
    }

    public async Task DeleteAsync(Guid id)
    {
        var topic = await GetTrackedOwnedTopicAsync(id);

        try
        {
            await _relationshipCleanup.RemoveRelationshipsForTopicsAsync(new[] { id });
            _context.Topics.Remove(topic);
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            throw new ConflictException("This item was already modified or deleted by another request.");
        }
    }

    public async Task<TopicDto> DuplicateAsync(Guid id)
    {
        var source = await GetTrackedOwnedTopicAsync(id);

        // Duplicates the single node only, offset slightly, with no relationships —
        // not a recursive subtree clone. Revisit if the product intent is "duplicate branch."
        var copy = new Topic
        {
            Id = Guid.NewGuid(),
            CanvasId = source.CanvasId,
            Title = $"{source.Title} (Copy)",
            X = source.X + 24,
            Y = source.Y + 24,
            Emoji = source.Emoji,
        };

        _context.Topics.Add(copy);
        await _context.SaveChangesAsync();
        return ToDto(copy);
    }

    private async Task<Topic> GetTrackedOwnedTopicAsync(Guid id)
    {
        var topic = await _context.Topics
            .Include(t => t.Canvas).ThenInclude(c => c.Workspace)
            .AsTracking()
            .FirstOrDefaultAsync(t => t.Id == id);

        if (topic is null) throw new NotFoundException($"Topic '{id}' was not found.");
        if (topic.Canvas.Workspace.UserId != _currentUser.UserId) throw new ForbiddenAccessException();
        return topic;
    }

    private static TopicDto ToDto(Topic topic) =>
        new(topic.Id, topic.CanvasId, topic.Title, topic.X, topic.Y, topic.Emoji, topic.CreatedAt, topic.RowVersion);
}
