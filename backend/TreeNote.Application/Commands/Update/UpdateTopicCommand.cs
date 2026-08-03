using System.ComponentModel.DataAnnotations;

namespace TreeNote.Application.Commands;

public record UpdateTopicCommand(
    [Required, MaxLength(200)] string Title,
    double X, double Y, string? Emoji,
    [Required] byte[] RowVersion);
