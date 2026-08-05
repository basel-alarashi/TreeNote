using MediatR;

namespace TreeNote.Application.Commands.Logout;

public record LogoutCommand(string RefreshToken) : IRequest;
