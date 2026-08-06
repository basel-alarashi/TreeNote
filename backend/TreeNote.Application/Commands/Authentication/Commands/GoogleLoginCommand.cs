using MediatR;
using TreeNote.Application.DTOs;

namespace TreeNote.Application.Commands.GoogleLogin;

public record GoogleLoginCommand(string IdToken) : IRequest<AuthResultDto>;
