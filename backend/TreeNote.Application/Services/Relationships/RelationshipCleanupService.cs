using Microsoft.EntityFrameworkCore;
using TreeNote.Application.Interfaces;

namespace TreeNote.Application.Services;

public class RelationshipCleanupService : IRelationshipCleanupService
{
    private readonly IApplicationDbContext _context;

    public RelationshipCleanupService(IApplicationDbContext context) => _context = context;

    public async Task RemoveRelationshipsForTopicsAsync(IEnumerable<Guid> topicIds, CancellationToken cancellationToken = default)
    {
        var ids = topicIds.ToList();
        if (ids.Count == 0) return;

        var relationships = await _context.Relationships
            .Where(r => ids.Contains(r.ParentId) || ids.Contains(r.ChildId))
            .ToListAsync(cancellationToken);

        if (relationships.Count == 0) return;

        _context.Relationships.RemoveRange(relationships);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
