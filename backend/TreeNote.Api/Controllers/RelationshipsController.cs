using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using TreeNote.Application.Commands;
using TreeNote.Application.DTOs;
using TreeNote.Application.Interfaces;

namespace TreeNote.Api.Controllers;

[ApiController]
[Route("api/v1/relationships")]
[Authorize]
public class RelationshipsController : ControllerBase
{
    private readonly IRelationshipService _relationshipService;
    public RelationshipsController(IRelationshipService relationshipService) => _relationshipService = relationshipService;

    [HttpPost]
    public async Task<ActionResult<RelationshipDto>> Create(CreateRelationshipCommand command, CancellationToken cancellationToken)
    {
        var result = await _relationshipService.CreateAsync(command, cancellationToken);
        return StatusCode(StatusCodes.Status201Created, result);
    }

    [HttpDelete]
    public async Task<IActionResult> Delete(DeleteRelationshipCommand command, CancellationToken cancellationToken)
    {
        await _relationshipService.DeleteAsync(command, cancellationToken);
        return NoContent();
    }
}
