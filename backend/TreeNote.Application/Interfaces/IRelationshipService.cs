using TreeNote.Application.Commands;
using TreeNote.Application.DTOs;

namespace TreeNote.Application.Interfaces;

public interface IRelationshipService
{
    Task<RelationshipDto> CreateAsync(CreateRelationshipCommand command);
    Task DeleteAsync(DeleteRelationshipCommand command);
}
