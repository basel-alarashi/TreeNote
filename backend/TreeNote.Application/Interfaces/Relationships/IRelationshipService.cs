using TreeNote.Application.Commands;
using TreeNote.Application.DTOs;

namespace TreeNote.Application.Interfaces;

public interface IRelationshipService
{
    Task<RelationshipDto> CreateAsync(CreateRelationshipCommand command, CancellationToken cancellationToken = default);
    Task DeleteAsync(DeleteRelationshipCommand command, CancellationToken cancellationToken = default);
}
