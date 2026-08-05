using MediatR;
using TreeNote.Application.DTOs;

namespace TreeNote.Application.Commands.RefreshToken;

public record RefreshTokenCommand(string RefreshToken) : IRequest<AuthResultDto>;
