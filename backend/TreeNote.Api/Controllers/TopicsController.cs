using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using TreeNote.Application.Commands;
using TreeNote.Application.DTOs;
using TreeNote.Application.Interfaces;

namespace TreeNote.Api.Controllers;

[ApiController]
[Route("api/v1/topics")]
[Authorize]
public class TopicsController : ControllerBase
{
    private readonly ITopicService _topicService;
    public TopicsController(ITopicService topicService) => _topicService = topicService;

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<TopicDto>> GetById(Guid id, CancellationToken cancellationToken) => Ok(await _topicService.GetByIdAsync(id, cancellationToken));

    [HttpPost]
    public async Task<ActionResult<TopicDto>> Create(CreateTopicCommand command, CancellationToken cancellationToken)
    {
        var result = await _topicService.CreateAsync(command, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<TopicDto>> Update(Guid id, UpdateTopicCommand command, CancellationToken cancellationToken) => Ok(await _topicService.UpdateAsync(id, command, cancellationToken));

    [HttpPut("positions")]
    public async Task<ActionResult<List<TopicDto>>> UpdatePositions(UpdateTopicPositionsCommand command, CancellationToken cancellationToken)
    => Ok(await _topicService.UpdatePositionsAsync(command, cancellationToken));

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        await _topicService.DeleteAsync(id, cancellationToken);
        return NoContent();
    }

    [HttpPost("{id:guid}/duplicate")]
    public async Task<ActionResult<TopicDto>> Duplicate(Guid id, CancellationToken cancellationToken)
    {
        var result = await _topicService.DuplicateAsync(id, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }
}
