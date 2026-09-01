using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using TreeNote.Application.Commands;
using TreeNote.Application.DTOs;
using TreeNote.Application.Interfaces;

namespace TreeNote.Api.Controllers;

[ApiController]
[Route("api/v1/workspaces")]
[Authorize]
public class WorkspacesController : ControllerBase
{
    private readonly IWorkspaceService _workspaceService;
    public WorkspacesController(IWorkspaceService workspaceService) => _workspaceService = workspaceService;

    [HttpGet]
    public async Task<ActionResult<List<WorkspaceDto>>> GetAll(CancellationToken cancellationToken) => Ok(await _workspaceService.GetAllForCurrentUserAsync(cancellationToken));

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<WorkspaceDto>> GetById(Guid id, CancellationToken cancellationToken) => Ok(await _workspaceService.GetByIdAsync(id, cancellationToken));

    [HttpPost]
    public async Task<ActionResult<WorkspaceDto>> Create(CreateWorkspaceCommand command, CancellationToken cancellationToken)
    {
        var result = await _workspaceService.CreateAsync(command, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<WorkspaceDto>> Update(Guid id, UpdateWorkspaceCommand command, CancellationToken cancellationToken) => Ok(await _workspaceService.UpdateAsync(id, command, cancellationToken));

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        await _workspaceService.DeleteAsync(id, cancellationToken);
        return NoContent();
    }
}
