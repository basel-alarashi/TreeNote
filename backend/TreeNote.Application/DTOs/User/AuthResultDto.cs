namespace TreeNote.Application.DTOs;

public record AuthResultDto(
    Guid UserId,
    string Email,
    string AccessToken,
    string RefreshToken,
    DateTime RefreshTokenExpiresAt);
