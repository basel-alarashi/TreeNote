using MediatR;
using TreeNote.Application.Interfaces;
using TreeNote.Application.Exceptions;
using TreeNote.Application.Interfaces;
using TreeNote.Application.DTOs;

namespace TreeNote.Application.Queries;

public class GetCurrentUserQueryHandler : IRequestHandler<GetCurrentUserQuery, UserProfileDto>
{
	private readonly IIdentityService _identityService;
	private readonly ICurrentUserService _currentUser;

	public GetCurrentUserQueryHandler(IIdentityService identityService, ICurrentUserService currentUser)
	{
		_identityService = identityService;
		_currentUser = currentUser;
	}

	public async Task<UserProfileDto> Handle(GetCurrentUserQuery request, CancellationToken cancellationToken)
	{
		var profile = await _identityService.GetProfileAsync(_currentUser.UserId)
			?? throw new NotFoundException("User not found.");

		return new UserProfileDto(profile.Id, profile.Email, profile.DisplayName, profile.CreatedAt);
	}
}