using Microsoft.EntityFrameworkCore;
using TreeNote.Application.Common.Interfaces;

namespace TreeNote.Application.Common.Services;

public class RelationshipCleanupService : IRelationshipCleanupService
{
    private readonly IApplicationDbContext _context;

    public RelationshipCleanupService(IApplicationDbContext context) => _context = context;

    public async Task RemoveRelationshipsForTopicsAsync(IEnumerable<Guid> topicIds)
    {
        var ids = topicIds.ToList();
        if (ids.Count == 0) return;

        var relationships = await _context.Relationships
            .Where(r => ids.Contains(r.ParentId) || ids.Contains(r.ChildId))
            .ToListAsync();

        if (relationships.Count == 0) return;

        _context.Relationships.RemoveRange(relationships);
        await _context.SaveChangesAsync();
    }
}
