using TreeNote.Application.DTOs;

namespace TreeNote.Application.Interfaces;

public interface IGoogleAuthService
{
    Task<GoogleUserPayload> VerifyIdTokenAsync(string idToken);
}
