using MediatR;
using TreeNote.Application.DTOs;
using TreeNote.Application.Interfaces;
using TreeNote.Application.Exceptions;
using RefreshTokenEntity = TreeNote.Domain.Entities.RefreshToken;

namespace TreeNote.Application.Commands.GoogleLogin;

public class GoogleLoginCommandHandler : IRequestHandler<GoogleLoginCommand, AuthResultDto>
{
    private readonly IGoogleAuthService _googleAuthService;
    private readonly IIdentityService _identityService;
    private readonly IJwtTokenService _tokenService;
    private readonly IJwtSettingsAccessor _jwtSettings;
    private readonly IApplicationDbContext _context;

    public GoogleLoginCommandHandler(
        IGoogleAuthService googleAuthService,
        IIdentityService identityService,
        IJwtTokenService tokenService,
        IJwtSettingsAccessor jwtSettings,
        IApplicationDbContext context)
    {
        _googleAuthService = googleAuthService;
        _identityService = identityService;
        _tokenService = tokenService;
        _jwtSettings = jwtSettings;
        _context = context;
    }

    public async Task<AuthResultDto> Handle(GoogleLoginCommand request, CancellationToken cancellationToken)
    {
        var payload = await _googleAuthService.VerifyIdTokenAsync(request.IdToken);

        if (!payload.EmailVerified)
            throw new ForbiddenAccessException("Google account email is not verified.");

        var result = await _identityService.GetOrCreateExternalUserAsync(
            provider: "Google",
            providerKey: payload.Subject,
            email: payload.Email);

        var accessToken = _tokenService.GenerateAccessToken(result.User.Id, result.User.Email);
        var refreshToken = _tokenService.GenerateRefreshToken();
        var refreshExpiresAt = DateTime.UtcNow.AddDays(_jwtSettings.RefreshTokenExpirationDays);

        _context.RefreshTokens.Add(new RefreshTokenEntity
        {
            Id = Guid.NewGuid(),
            UserId = result.User.Id,
            TokenHash = _tokenService.HashToken(refreshToken),
            ExpiresAt = refreshExpiresAt,
            CreatedAt = DateTime.UtcNow
        });

        await _context.SaveChangesAsync(cancellationToken);

        return new AuthResultDto(result.User.Id, result.User.Email, accessToken, refreshToken, refreshExpiresAt);
    }
}
