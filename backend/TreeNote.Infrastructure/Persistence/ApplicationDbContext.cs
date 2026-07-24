using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using TreeNote.Infrastructure.Identity;
using TreeNote.Domain.Entities;
using TreeNote.Infrastructure.Configurations;
using TreeNote.Application.Common.Interfaces;

namespace TreeNote.Infrastructure.Persistence;

public class ApplicationDbContext
    : IdentityDbContext<ApplicationUser, IdentityRole<Guid>, Guid>, IApplicationDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Workspace> Workspaces => Set<Workspace>();
    public DbSet<Canvas> Canvases => Set<Canvas>();
    public DbSet<Topic> Topics => Set<Topic>();
    public DbSet<Relationship> Relationships => Set<Relationship>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.ApplyConfiguration(new WorkspaceConfiguration());
        builder.ApplyConfiguration(new CanvasConfiguration());
        builder.ApplyConfiguration(new TopicConfiguration());
        builder.ApplyConfiguration(new RelationshipConfiguration());
    }
}
