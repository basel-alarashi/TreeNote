using MediatR;
using TreeNote.Application.DTOs;
using TreeNote.Application.Interfaces;
using TreeNote.Application.Exceptions;
using RefreshTokenEntity = TreeNote.Domain.Entities.RefreshToken;

namespace TreeNote.Application.Commands.Login;

public class LoginCommandHandler : IRequestHandler<LoginCommand, AuthResultDto>
{
    private readonly IIdentityService _identityService;
    private readonly IJwtTokenService _tokenService;
    private readonly IJwtSettingsAccessor _jwtSettings;
    private readonly IApplicationDbContext _context;

    public LoginCommandHandler(
        IIdentityService identityService,
        IJwtTokenService tokenService,
        IJwtSettingsAccessor jwtSettings,
        IApplicationDbContext context)
    {
        _identityService = identityService;
        _tokenService = tokenService;
        _jwtSettings = jwtSettings;
        _context = context;
    }

    public async Task<AuthResultDto> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var user = await _identityService.FindByEmailAsync(request.Email);
        if (user is null || !await _identityService.CheckPasswordAsync(user.Id, request.Password))
            throw new ForbiddenAccessException("Invalid email or password.");

        var accessToken = _tokenService.GenerateAccessToken(user.Id, user.Email);
        var refreshToken = _tokenService.GenerateRefreshToken();
        var refreshExpiresAt = DateTime.UtcNow.AddDays(_jwtSettings.RefreshTokenExpirationDays);

        _context.RefreshTokens.Add(new RefreshTokenEntity
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            TokenHash = _tokenService.HashToken(refreshToken),
            ExpiresAt = refreshExpiresAt,
            CreatedAt = DateTime.UtcNow
        });

        await _context.SaveChangesAsync(cancellationToken);

        return new AuthResultDto(user.Id, user.Email, accessToken, refreshToken, refreshExpiresAt);
    }
}
