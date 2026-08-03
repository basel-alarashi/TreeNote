using TreeNote.Application.Commands;
using TreeNote.Application.DTOs;

namespace TreeNote.Application.Interfaces;

public interface ITopicService
{
    Task<TopicDto> GetByIdAsync(Guid id);
    Task<TopicDto> CreateAsync(CreateTopicCommand command);
    Task<TopicDto> UpdateAsync(Guid id, UpdateTopicCommand command);
    Task<List<TopicDto>> UpdatePositionsAsync(UpdateTopicPositionsCommand command);
    Task DeleteAsync(Guid id);
    Task<TopicDto> DuplicateAsync(Guid id);
}
