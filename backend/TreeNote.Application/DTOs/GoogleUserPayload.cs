namespace TreeNote.Application.DTOs;

public record GoogleUserPayload(string Subject, string Email, bool EmailVerified, string? Name);
