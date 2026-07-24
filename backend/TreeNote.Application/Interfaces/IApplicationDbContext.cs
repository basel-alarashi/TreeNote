using Microsoft.EntityFrameworkCore;
using TreeNote.Domain.Entities;

namespace TreeNote.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<Workspace> Workspaces { get; }
    DbSet<Canvas> Canvases { get; }
    DbSet<Topic> Topics { get; }
    DbSet<Relationship> Relationships { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
