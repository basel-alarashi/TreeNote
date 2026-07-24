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
        var topic = await GetOwnedTopicAsync(id);
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
        _context.Add(topic);

        if (command.ParentId is { } parentId)
        {
            var parent = await _context.FirstOrDefaultAsync(t => t.Id == parentId);
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
        var topic = await GetOwnedTopicAsync(id);
        topic.Title = command.Title;
        topic.X = command.X;
        topic.Y = command.Y;
        topic.Emoji = command.Emoji;
        await _context.SaveChangesAsync();
        return ToDto(topic);
    }

    public async Task DeleteAsync(Guid id)
    {
        var topic = await GetOwnedTopicAsync(id);
        await _relationshipCleanup.RemoveRelationshipsForTopicsAsync(new[] { id });
        _context.Remove(topic);
        await _context.SaveChangesAsync();
    }

    public async Task<TopicDto> DuplicateAsync(Guid id)
    {
        var source = await GetOwnedTopicAsync(id);

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

        _context.Add(copy);
        await _context.SaveChangesAsync();
        return ToDto(copy);
    }

    private async Task<Topic> GetOwnedTopicAsync(Guid id)
    {
        var topic = await _context
            .Include(t => t.Canvas)
            .ThenInclude(c => c.Workspace)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (topic is null) throw new NotFoundException($"Topic '{id}' was not found.");
        if (topic.Canvas.Workspace.UserId != _currentUser.UserId) throw new ForbiddenAccessException();
        return topic;
    }

    private static TopicDto ToDto(Topic topic) =>
        new(topic.Id, topic.CanvasId, topic.Title, topic.X, topic.Y, topic.Emoji, topic.CreatedAt);
}
