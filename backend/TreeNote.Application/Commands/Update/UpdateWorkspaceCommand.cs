using System.ComponentModel.DataAnnotations;
namespace TreeNote.Application.Commands;

public record UpdateWorkspaceCommand([Required, MaxLength(200)] string Name);
