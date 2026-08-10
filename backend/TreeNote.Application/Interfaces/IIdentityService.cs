using TreeNote.Application.DTOs;

namespace TreeNote.Application.Interfaces;

public record CreateUserResult(bool Succeeded, Guid UserId, IReadOnlyList<string> Errors);
public record UserProfileDtoResult(Guid Id, string Email, string? DisplayName, DateTime CreatedAt);
public record IdentityOperationResult(bool Succeeded, IReadOnlyList<string> Errors);

public interface IIdentityService
{
    Task<UserDto?> FindByEmailAsync(string email);
    Task<UserDto?> FindByIdAsync(Guid userId);
    Task<CreateUserResult> CreateUserAsync(string email, string password);
    Task<bool> CheckPasswordAsync(Guid userId, string password);

    Task<UserDto?> FindByLoginAsync(string provider, string providerKey);
    Task<ExternalLoginResult> GetOrCreateExternalUserAsync(string provider, string providerKey, string email);

    Task<UserProfileDtoResult?> GetProfileAsync(Guid userId);
    Task<bool> UpdateDisplayNameAsync(Guid userId, string displayName);
    Task<IdentityOperationResult> ChangePasswordAsync(Guid userId, string currentPassword, string newPassword);
}
