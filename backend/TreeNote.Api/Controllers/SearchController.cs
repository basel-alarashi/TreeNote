using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TreeNote.Application.DTOs;
using TreeNote.Application.Interfaces;

namespace TreeNote.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/search")]
public sealed class SearchController : ControllerBase
{
    private readonly ISearchService _searchService;

    public SearchController(ISearchService searchService)
    {
        _searchService = searchService;
    }

    /// <summary>
    /// GET /api/v1/search/topics?query=...
    /// Case-insensitive, partial-match search over the current user's own topics.
    /// </summary>
    [HttpGet("topics")]
    [ProducesResponseType(typeof(IReadOnlyList<SearchTopicDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<SearchTopicDto>>> SearchTopics(
        [FromQuery] string? query,
        CancellationToken cancellationToken)
    {
        var results = await _searchService.SearchTopicsAsync(query, cancellationToken);
        return Ok(results);
    }
}
