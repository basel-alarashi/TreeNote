namespace TreeNote.Domain.Entities;

public class Topic
{
    public Guid Id { get; set; }
    public Guid CanvasId { get; set; }
    public string Title { get; set; } = string.Empty;
    public double X { get; set; }
    public double Y { get; set; }
    public string? Emoji { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public byte[] RowVersion { get; set; } = Array.Empty<byte>();

    public Canvas Canvas { get; set; } = null!;

    // Relationships where this topic is the PARENT (points down to children)
    public ICollection<Relationship> OutgoingRelationships { get; set; } = new List<Relationship>();

    // Relationships where this topic is the CHILD (points up to parents)
    public ICollection<Relationship> IncomingRelationships { get; set; } = new List<Relationship>();
}
