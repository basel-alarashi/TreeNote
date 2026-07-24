namespace TreeNote.Application.Relationships.Commands;

public record DeleteRelationshipCommand(Guid ParentId, Guid ChildId);
