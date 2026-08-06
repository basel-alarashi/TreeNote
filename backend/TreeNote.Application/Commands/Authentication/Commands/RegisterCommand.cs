using MediatR;
using TreeNote.Application.DTOs;

namespace TreeNote.Application.Commands.Register;

public record RegisterCommand(string Email, string Password) : IRequest<AuthResultDto>;
