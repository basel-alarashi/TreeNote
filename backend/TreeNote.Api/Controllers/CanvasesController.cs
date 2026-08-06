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
    public async Task<ActionResult<List<CanvasDto>>> GetByWorkspace([FromQuery] Guid? workspaceId)
    {
        if (workspaceId is null) return BadRequest("workspaceId query parameter is required.");
        return Ok(await _canvasService.GetByWorkspaceAsync(workspaceId.Value));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<CanvasDetailDto>> GetById(Guid id) => Ok(await _canvasService.GetByIdAsync(id));

    [HttpPost]
    public async Task<ActionResult<CanvasDto>> Create(CreateCanvasCommand command)
    {
        var result = await _canvasService.CreateAsync(command);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<CanvasDto>> Update(Guid id, UpdateCanvasCommand command) => Ok(await _canvasService.UpdateAsync(id, command));

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _canvasService.DeleteAsync(id);
        return NoContent();
    }
}
