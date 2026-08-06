using MediatR;
using Microsoft.EntityFrameworkCore;
using TreeNote.Application.DTOs;
using TreeNote.Application.Interfaces;
using TreeNote.Application.Exceptions;
using RefreshTokenEntity = TreeNote.Domain.Entities.RefreshToken;

namespace TreeNote.Application.Commands.RefreshToken;

public class RefreshTokenCommandHandler : IRequestHandler<RefreshTokenCommand, AuthResultDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IJwtTokenService _tokenService;
    private readonly IJwtSettingsAccessor _jwtSettings;
    private readonly IIdentityService _identityService;

    public RefreshTokenCommandHandler(
        IApplicationDbContext context,
        IJwtTokenService tokenService,
        IJwtSettingsAccessor jwtSettings,
        IIdentityService identityService)
    {
        _context = context;
        _tokenService = tokenService;
        _jwtSettings = jwtSettings;
        _identityService = identityService;
    }

    public async Task<AuthResultDto> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
    {
        var incomingHash = _tokenService.HashToken(request.RefreshToken);

        var stored = await _context.RefreshTokens
            .FirstOrDefaultAsync(rt => rt.TokenHash == incomingHash, cancellationToken);

        if (stored is null)
            throw new UnauthorizedException("Invalid refresh token.");

        if (stored.RevokedAt is not null)
        {
            var activeTokens = await _context.RefreshTokens
                .Where(rt => rt.UserId == stored.UserId && rt.RevokedAt == null)
                .ToListAsync(cancellationToken);

            foreach (var t in activeTokens)
                t.RevokedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync(cancellationToken);
            throw new UnauthorizedException("Refresh token has already been used. All sessions revoked.");
        }

        if (DateTime.UtcNow >= stored.ExpiresAt)
            throw new UnauthorizedException("Refresh token has expired.");

        var user = await _identityService.FindByIdAsync(stored.UserId);
        if (user is null)
            throw new UnauthorizedException("User no longer exists.");

        var newRefreshToken = _tokenService.GenerateRefreshToken();
        var newHash = _tokenService.HashToken(newRefreshToken);
        var newExpiresAt = DateTime.UtcNow.AddDays(_jwtSettings.RefreshTokenExpirationDays);

        stored.RevokedAt = DateTime.UtcNow;
        stored.ReplacedByTokenHash = newHash;

        _context.RefreshTokens.Add(new RefreshTokenEntity
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            TokenHash = newHash,
            ExpiresAt = newExpiresAt,
            CreatedAt = DateTime.UtcNow
        });

        await _context.SaveChangesAsync(cancellationToken);

        var newAccessToken = _tokenService.GenerateAccessToken(user.Id, user.Email);

        return new AuthResultDto(user.Id, user.Email, newAccessToken, newRefreshToken, newExpiresAt);
    }
}
