using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using TreeNote.Application.Interfaces;

namespace TreeNote.Infrastructure.Authentication;

public class JwtTokenService : IJwtTokenService
{
	private readonly JwtSettings _settings;

	public JwtTokenService(IOptions<JwtSettings> options)
	{
		_settings = options.Value;
	}

	public string GenerateAccessToken(Guid userId, string email)
	{
		var claims = new[]
		{
			new Claim(JwtRegisteredClaimNames.Sub, userId.ToString()),
			new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
			new Claim(JwtRegisteredClaimNames.Email, email),
			new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
		};

		var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_settings.Secret));
		var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

		var token = new JwtSecurityToken(
			issuer: _settings.Issuer,
			audience: _settings.Audience,
			claims: claims,
			expires: DateTime.UtcNow.AddMinutes(_settings.AccessTokenExpirationMinutes),
			signingCredentials: creds);

		return new JwtSecurityTokenHandler().WriteToken(token);
	}

	public string GenerateRefreshToken()
	{
		var randomBytes = RandomNumberGenerator.GetBytes(64);
		return Convert.ToBase64String(randomBytes);
	}

	public string HashToken(string token)
	{
		var bytes = Encoding.UTF8.GetBytes(token);
		var hash = SHA256.HashData(bytes);
		return Convert.ToBase64String(hash);
	}
}