using Microsoft.AspNetCore.Mvc;
using TreeNote.Application.Commands;
using TreeNote.Application.DTOs;
using TreeNote.Application.Interfaces;

namespace TreeNote.Api.Controllers;

[ApiController]
[Route("api/v1/topics")]
public class TopicsController : ControllerBase
{
    private readonly ITopicService _topicService;
    public TopicsController(ITopicService topicService) => _topicService = topicService;

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<TopicDto>> GetById(Guid id) => Ok(await _topicService.GetByIdAsync(id));

    [HttpPost]
    public async Task<ActionResult<TopicDto>> Create(CreateTopicCommand command)
    {
        var result = await _topicService.CreateAsync(command);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<TopicDto>> Update(Guid id, UpdateTopicCommand command) => Ok(await _topicService.UpdateAsync(id, command));

    [HttpPut("positions")]
    public async Task<ActionResult<List<TopicDto>>> UpdatePositions(UpdateTopicPositionsCommand command)
    => Ok(await _topicService.UpdatePositionsAsync(command));

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _topicService.DeleteAsync(id);
        return NoContent();
    }

    [HttpPost("{id:guid}/duplicate")]
    public async Task<ActionResult<TopicDto>> Duplicate(Guid id)
    {
        var result = await _topicService.DuplicateAsync(id);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }
}
