using Google.Apis.Auth;
using Microsoft.Extensions.Options;
using TreeNote.Application.DTOs;
using TreeNote.Application.Interfaces;
using TreeNote.Application.Exceptions;

namespace TreeNote.Infrastructure.Authentication;

public class GoogleAuthService : IGoogleAuthService
{
    private readonly GoogleSettings _settings;

    public GoogleAuthService(IOptions<GoogleSettings> options)
    {
        _settings = options.Value;
    }

    public async Task<GoogleUserPayload> VerifyIdTokenAsync(string idToken)
    {
        try
        {
            var settings = new GoogleJsonWebSignature.ValidationSettings
            {
                Audience = new[] { _settings.ClientId }
            };

            var payload = await GoogleJsonWebSignature.ValidateAsync(idToken, settings);

            return new GoogleUserPayload(
                payload.Subject,
                payload.Email,
                payload.EmailVerified,
                payload.Name);
        }
        catch (InvalidJwtException)
        {
            throw new ForbiddenAccessException("Invalid Google ID token.");
        }
    }
}
