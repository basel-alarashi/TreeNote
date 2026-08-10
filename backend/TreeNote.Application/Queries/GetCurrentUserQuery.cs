using MediatR;
using TreeNote.Application.DTOs;

namespace TreeNote.Application.Queries;

public record GetCurrentUserQuery : IRequest<UserProfileDto>;
