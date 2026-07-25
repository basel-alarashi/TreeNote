using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TreeNote.Domain.Entities;

namespace TreeNote.Infrastructure.Configurations;

public class CanvasConfiguration : IEntityTypeConfiguration<Canvas>
{
    public void Configure(EntityTypeBuilder<Canvas> builder)
    {
        builder.ToTable("Canvases");
        builder.HasKey(c => c.Id);

        builder.Property(c => c.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.HasIndex(c => c.WorkspaceId);

        builder.HasMany(c => c.Topics)
            .WithOne(t => t.Canvas)
            .HasForeignKey(t => t.CanvasId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
