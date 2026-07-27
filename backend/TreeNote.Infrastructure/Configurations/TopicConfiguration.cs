using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TreeNote.Domain.Entities;

namespace TreeNote.Infrastructure.Configurations;

public class TopicConfiguration : IEntityTypeConfiguration<Topic>
{
    public void Configure(EntityTypeBuilder<Topic> builder)
    {
        builder.ToTable("Topics");
        builder.HasKey(t => t.Id);

        builder.Property(t => t.Title)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(t => t.Emoji)
            .HasMaxLength(10);

        builder.HasIndex(t => t.CanvasId);

        builder.Property(t => t.RowVersion).IsRowVersion();
    }
}
