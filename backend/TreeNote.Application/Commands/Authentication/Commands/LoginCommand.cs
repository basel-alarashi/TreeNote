using MediatR;
using TreeNote.Application.DTOs;

namespace TreeNote.Application.Commands.Login;

public record LoginCommand(string Email, string Password) : IRequest<AuthResultDto>;
