using MediatR;
using TreeNote.Application.Interfaces;
using TreeNote.Application.Exceptions;
using TreeNote.Application.DTOs;

namespace TreeNote.Application.Commands;

public class UpdateProfileCommandHandler : IRequestHandler<UpdateProfileCommand, UserProfileDto>
{
    private readonly IIdentityService _identityService;
    private readonly ICurrentUserService _currentUser;

    public UpdateProfileCommandHandler(IIdentityService identityService, ICurrentUserService currentUser)
    {
        _identityService = identityService;
        _currentUser = currentUser;
    }

    public async Task<UserProfileDto> Handle(UpdateProfileCommand request, CancellationToken cancellationToken)
    {
        var updated = await _identityService.UpdateDisplayNameAsync(_currentUser.UserId, request.DisplayName);
        if (!updated)
            throw new NotFoundException("User not found.");

        var profile = await _identityService.GetProfileAsync(_currentUser.UserId)
            ?? throw new NotFoundException("User not found.");

        return new UserProfileDto(profile.Id, profile.Email, profile.DisplayName, profile.CreatedAt);
    }
}
