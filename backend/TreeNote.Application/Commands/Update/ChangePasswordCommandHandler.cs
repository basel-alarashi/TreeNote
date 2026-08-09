using MediatR;
using TreeNote.Application.Authentication.Interfaces;
using TreeNote.Application.Common.Exceptions;
using TreeNote.Application.Common.Interfaces;

namespace TreeNote.Application.Users.Commands.ChangePassword;

public class ChangePasswordCommandHandler : IRequestHandler<ChangePasswordCommand>
{
    private readonly IIdentityService _identityService;
    private readonly ICurrentUserService _currentUser;

    public ChangePasswordCommandHandler(IIdentityService identityService, ICurrentUserService currentUser)
    {
        _identityService = identityService;
        _currentUser = currentUser;
    }

    public async Task Handle(ChangePasswordCommand request, CancellationToken cancellationToken)
    {
        var result = await _identityService.ChangePasswordAsync(
            _currentUser.UserId, request.CurrentPassword, request.NewPassword);

        if (!result.Succeeded)
            throw new ValidationException(string.Join("; ", result.Errors));
    }
}
