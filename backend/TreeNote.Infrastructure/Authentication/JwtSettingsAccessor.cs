using Microsoft.Extensions.Options;
using TreeNote.Application.Interfaces;

namespace TreeNote.Infrastructure.Authentication;

public class JwtSettingsAccessor : IJwtSettingsAccessor
{
    private readonly JwtSettings _settings;
    public JwtSettingsAccessor(IOptions<JwtSettings> options) => _settings = options.Value;
    public int RefreshTokenExpirationDays => _settings.RefreshTokenExpirationDays;
}
