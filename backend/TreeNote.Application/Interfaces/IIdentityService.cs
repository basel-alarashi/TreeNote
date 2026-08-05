using TreeNote.Application.DTOs;

namespace TreeNote.Application.Interfaces;

public record CreateUserResult(bool Succeeded, Guid UserId, IReadOnlyList<string> Errors);

public interface IIdentityService
{
    Task<UserDto?> FindByEmailAsync(string email);
    Task<UserDto?> FindByIdAsync(Guid userId);
    Task<CreateUserResult> CreateUserAsync(string email, string password);
    Task<bool> CheckPasswordAsync(Guid userId, string password);
}
