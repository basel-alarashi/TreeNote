using MediatR;
using TreeNote.Application.DTOs;
using TreeNote.Application.Interfaces;
using TreeNote.Application.Exceptions;
using RefreshTokenEntity = TreeNote.Domain.Entities.RefreshToken;

namespace TreeNote.Application.Commands.Register;

public class RegisterCommandHandler : IRequestHandler<RegisterCommand, AuthResultDto>
{
    private readonly IIdentityService _identityService;
    private readonly IJwtTokenService _tokenService;
    private readonly IJwtSettingsAccessor _jwtSettings;
    private readonly IApplicationDbContext _context;

    public RegisterCommandHandler(
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

    public async Task<AuthResultDto> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        var existing = await _identityService.FindByEmailAsync(request.Email);
        if (existing is not null)
            throw new ConflictException("An account with this email already exists.");

        var createResult = await _identityService.CreateUserAsync(request.Email, request.Password);
        if (!createResult.Succeeded)
            throw new BusinessRuleException(string.Join("; ", createResult.Errors));

        var accessToken = _tokenService.GenerateAccessToken(createResult.UserId, request.Email);
        var refreshToken = _tokenService.GenerateRefreshToken();
        var refreshExpiresAt = DateTime.UtcNow.AddDays(_jwtSettings.RefreshTokenExpirationDays);

        _context.RefreshTokens.Add(new RefreshTokenEntity
        {
            Id = Guid.NewGuid(),
            UserId = createResult.UserId,
            TokenHash = _tokenService.HashToken(refreshToken),
            ExpiresAt = refreshExpiresAt,
            CreatedAt = DateTime.UtcNow
        });

        await _context.SaveChangesAsync(cancellationToken);

        return new AuthResultDto(createResult.UserId, request.Email, accessToken, refreshToken, refreshExpiresAt);
    }
}
