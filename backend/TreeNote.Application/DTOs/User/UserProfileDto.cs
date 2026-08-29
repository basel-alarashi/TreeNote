namespace TreeNote.Application.DTOs;

public record UserProfileDto(Guid Id, string Email, string? DisplayName, DateTime CreatedAt);
