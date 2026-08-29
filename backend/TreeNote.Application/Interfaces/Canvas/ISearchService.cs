using TreeNote.Application.DTOs;

namespace TreeNote.Application.Interfaces;

public interface ISearchService
{
    /// <summary>
    /// Searches topics by title (case-insensitive, partial match), restricted to
    /// canvases/workspaces owned by the current authenticated user.
    /// Returns an empty list for a null/empty/whitespace query instead of throwing,
    /// per the Sprint 5 rule "Empty queries should not execute a search."
    /// </summary>
    Task<IReadOnlyList<SearchTopicDto>> SearchTopicsAsync(string? query, CancellationToken cancellationToken = default);
}
