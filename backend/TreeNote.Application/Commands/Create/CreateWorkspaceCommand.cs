using System.ComponentModel.DataAnnotations;
namespace TreeNote.Application.Commands;

public record CreateWorkspaceCommand([Required, MaxLength(200)] string Name);
