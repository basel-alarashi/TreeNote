namespace TreeNote.Application.Relationships.Commands;

public record CreateRelationshipCommand(Guid ParentId, Guid ChildId);
