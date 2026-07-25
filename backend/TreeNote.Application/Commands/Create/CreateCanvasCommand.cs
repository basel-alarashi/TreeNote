using System.ComponentModel.DataAnnotations;
namespace TreeNote.Application.Commands;

public record CreateCanvasCommand(
    [Required] Guid WorkspaceId,
    [Required, MaxLength(200)] string Name);
