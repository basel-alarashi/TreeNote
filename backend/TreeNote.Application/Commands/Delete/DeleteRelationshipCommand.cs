namespace TreeNote.Application.Commands;

public record DeleteRelationshipCommand(Guid ParentId, Guid ChildId);
