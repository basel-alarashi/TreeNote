using TreeNote.Application.Commands;
using TreeNote.Application.DTOs;

namespace TreeNote.Application.Interfaces;

public interface ITopicService
{
    Task<TopicDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<TopicDto> CreateAsync(CreateTopicCommand command, CancellationToken cancellationToken = default);
    Task<TopicDto> UpdateAsync(Guid id, UpdateTopicCommand command, CancellationToken cancellationToken = default);
    Task<List<TopicDto>> UpdatePositionsAsync(UpdateTopicPositionsCommand command, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    Task<TopicDto> DuplicateAsync(Guid id, CancellationToken cancellationToken = default);
}
