using TreeNote.Application.Topics.Commands;
using TreeNote.Application.Topics.DTOs;

namespace TreeNote.Application.Topics.Interfaces;

public interface ITopicService
{
    Task<TopicDto> GetByIdAsync(Guid id);
    Task<TopicDto> CreateAsync(CreateTopicCommand command);
    Task<TopicDto> UpdateAsync(Guid id, UpdateTopicCommand command);
    Task DeleteAsync(Guid id);
    Task<TopicDto> DuplicateAsync(Guid id);
}
