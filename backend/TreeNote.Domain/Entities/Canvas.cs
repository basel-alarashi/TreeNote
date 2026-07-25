namespace TreeNote.Domain.Entities;

public class Canvas
{
    public Guid Id { get; set; }
    public Guid WorkspaceId { get; set; }
    public string Name { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Workspace Workspace { get; set; } = null!;
    public ICollection<Topic> Topics { get; set; } = new List<Topic>();
}
