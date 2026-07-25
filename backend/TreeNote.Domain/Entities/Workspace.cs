namespace TreeNote.Domain.Entities;

public class Workspace
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Canvas> Canvases { get; set; } = new List<Canvas>();
}
