namespace TreeNote.Domain.Entities;

public class Relationship
{
    public Guid ParentId { get; set; }
    public Guid ChildId { get; set; }

    public Topic Parent { get; set; } = null!;
    public Topic Child { get; set; } = null!;
}
