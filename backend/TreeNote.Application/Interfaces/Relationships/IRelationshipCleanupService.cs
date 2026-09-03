namespace TreeNote.Application.Interfaces;

public interface IRelationshipCleanupService
{
    /// <summary>Removes all relationships (as parent or child) referencing any of the given topics.
    /// Must be called before deleting those topics — Relationship FKs use Restrict, not Cascade.</summary>
    Task RemoveRelationshipsForTopicsAsync(IEnumerable<Guid> topicIds, CancellationToken cancellationToken = default);
}
