using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TreeNote.Application.DTOs;
using TreeNote.Application.Interfaces;

namespace TreeNote.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/sync")]
public sealed class SyncController : ControllerBase
{
    private readonly ISyncService _syncService;

    public SyncController(ISyncService syncService)
    {
        _syncService = syncService;
    }

    [HttpPost]
    [ProducesResponseType(typeof(SyncResponseDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<SyncResponseDto>> Sync([FromBody] SyncRequestDto request, CancellationToken cancellationToken)
    {
        return Ok(await _syncService.ProcessChangesAsync(request, cancellationToken));
    }
}
