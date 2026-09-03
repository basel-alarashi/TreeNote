using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using TreeNote.Application.Commands;
using TreeNote.Application.DTOs;
using TreeNote.Application.Interfaces;

namespace TreeNote.Api.Controllers;

[ApiController]
[Route("api/v1/canvases")]
[Authorize]
public class CanvasesController : ControllerBase
{
    private readonly ICanvasService _canvasService;
    public CanvasesController(ICanvasService canvasService) => _canvasService = canvasService;

    [HttpGet]
    public async Task<ActionResult<List<CanvasDto>>> GetByWorkspace([FromQuery] Guid? workspaceId, CancellationToken cancellationToken)
    {
        if (workspaceId is null) return BadRequest("workspaceId query parameter is required.");
        return Ok(await _canvasService.GetByWorkspaceAsync(workspaceId.Value, cancellationToken));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<CanvasDetailDto>> GetById(Guid id, CancellationToken cancellationToken) => Ok(await _canvasService.GetByIdAsync(id, cancellationToken));

    [HttpPost]
    public async Task<ActionResult<CanvasDto>> Create(CreateCanvasCommand command, CancellationToken cancellationToken)
    {
        var result = await _canvasService.CreateAsync(command, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<CanvasDto>> Update(Guid id, UpdateCanvasCommand command, CancellationToken cancellationToken) => Ok(await _canvasService.UpdateAsync(id, command, cancellationToken));

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        await _canvasService.DeleteAsync(id, cancellationToken);
        return NoContent();
    }
}
