using Microsoft.EntityFrameworkCore;
using TreeNote.Application.Interfaces;
using TreeNote.Application.DTOs;

namespace TreeNote.Application.Services;

public sealed class SearchService : ISearchService
{
    private const int MaxResults = 50;

    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public SearchService(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<IReadOnlyList<SearchTopicDto>> SearchTopicsAsync(string? query, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(query))
        {
            return Array.Empty<SearchTopicDto>();
        }

        var userId = _currentUserService.UserId;
        var normalizedQuery = query.Trim().ToLower();

        // Topic -> Canvas -> Workspace ownership chain enforces NFR-SEC-004 /
        // BR-002 (users cannot access another user's data) at the query level,
        // rather than filtering in memory after the fact.
        return await _context.Topics
            .AsNoTracking()
            .Where(topic => topic.Canvas.Workspace.UserId == userId)
            .Where(topic => topic.Title.ToLower().Contains(normalizedQuery))
            .OrderBy(topic => topic.Title)
            .Select(topic => new SearchTopicDto
            {
                TopicId = topic.Id,
                CanvasId = topic.CanvasId,
                CanvasName = topic.Canvas.Name,
                Title = topic.Title,
                Emoji = topic.Emoji
            })
            .Take(MaxResults)
            .ToListAsync(cancellationToken);
    }
}
