using System.ComponentModel.DataAnnotations;
namespace TreeNote.Application.Commands;

// Covers rename and position changes ("move" in the backlog sense of dragging a
// node). Re-parenting a topic in the tree is done via the Relationship endpoints,
// not here — the API spec has no dedicated "move" route.
public record UpdateTopicCommand(
    [Required, MaxLength(200)] string Title,
    double X, double Y, string? Emoji);
