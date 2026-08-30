using MediatR;
using Microsoft.EntityFrameworkCore;
using TreeNote.Application.Interfaces;

namespace TreeNote.Application.Commands.Logout;

public class LogoutCommandHandler : IRequestHandler<LogoutCommand>
{
    private readonly IApplicationDbContext _context;
    private readonly IJwtTokenService _tokenService;

    public LogoutCommandHandler(IApplicationDbContext context, IJwtTokenService tokenService)
    {
        _context = context;
        _tokenService = tokenService;
    }

    public async Task<Unit> Handle(LogoutCommand request, CancellationToken cancellationToken)
    {
        var hash = _tokenService.HashToken(request.RefreshToken);

        var stored = await _context.RefreshTokens
            .AsTracking()
            .FirstOrDefaultAsync(rt => rt.TokenHash == hash, cancellationToken);

        if (stored is not null && stored.RevokedAt is null)
        {
            stored.RevokedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync(cancellationToken);
        }

        return Unit.Value;
    }
}
