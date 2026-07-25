using System.ComponentModel.DataAnnotations;
namespace TreeNote.Application.Commands;

public record UpdateCanvasCommand([Required, MaxLength(200)] string Name);
