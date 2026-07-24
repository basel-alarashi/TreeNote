using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TreeNote.Domain.Entities;

namespace TreeNote.Infrastructure.Configurations;

public class RelationshipConfiguration : IEntityTypeConfiguration<Relationship>
{
    public void Configure(EntityTypeBuilder<Relationship> builder)
    {
        builder.ToTable("Relationships");
        builder.HasKey(r => new { r.ParentId, r.ChildId });

        // Restrict (not Cascade) on both FKs: SQL Server rejects multiple cascade
        // paths into the same table. We delete a topic's relationships explicitly
        // in the service layer before removing the topic itself (Stage B).
        builder.HasOne(r => r.Parent)
            .WithMany(t => t.OutgoingRelationships)
            .HasForeignKey(r => r.ParentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(r => r.Child)
            .WithMany(t => t.IncomingRelationships)
            .HasForeignKey(r => r.ChildId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(r => r.ParentId);
        builder.HasIndex(r => r.ChildId);
    }
}
