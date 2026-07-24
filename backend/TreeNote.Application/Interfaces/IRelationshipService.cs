using TreeNote.Application.Relationships.Commands;
using TreeNote.Application.Relationships.DTOs;

namespace TreeNote.Application.Relationships.Interfaces;

public interface IRelationshipService
{
    Task<RelationshipDto> CreateAsync(CreateRelationshipCommand command);
    Task DeleteAsync(DeleteRelationshipCommand command);
}
