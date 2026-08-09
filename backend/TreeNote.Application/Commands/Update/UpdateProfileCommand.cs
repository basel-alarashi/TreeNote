using MediatR;
using TreeNote.Application.DTOs;

namespace TreeNote.Application.Commands;

public record UpdateProfileCommand(string DisplayName) : IRequest<UserProfileDto>;
