using System.ComponentModel.DataAnnotations;
namespace TreeNote.Application.Commands;

// ParentId is optional: null creates a root topic, a value creates a child
// (and an initial Relationship is created automatically).
public record CreateTopicCommand(
    [Required] Guid CanvasId,
    [Required, MaxLength(200)] string Title,
    double X, double Y, string? Emoji, Guid? ParentId);
