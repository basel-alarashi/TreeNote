using System.ComponentModel.DataAnnotations;
namespace TreeNote.Application.Commands;

public record CreateRelationshipCommand(Guid ParentId, Guid ChildId);
