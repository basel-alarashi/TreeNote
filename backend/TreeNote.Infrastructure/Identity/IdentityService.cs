using Microsoft.AspNetCore.Identity;
using TreeNote.Application.DTOs;
using TreeNote.Application.Interfaces;

namespace TreeNote.Infrastructure.Identity;

public class IdentityService : IIdentityService
{
    private readonly UserManager<ApplicationUser> _userManager;

    public IdentityService(UserManager<ApplicationUser> userManager)
    {
        _userManager = userManager;
    }

    public async Task<UserDto?> FindByEmailAsync(string email)
    {
        var user = await _userManager.FindByEmailAsync(email);
        return user is null ? null : new UserDto(user.Id, user.Email!);
    }

    public async Task<UserDto?> FindByIdAsync(Guid userId)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        return user is null ? null : new UserDto(user.Id, user.Email!);
    }

    public async Task<CreateUserResult> CreateUserAsync(string email, string password)
    {
        var user = new ApplicationUser
        {
            UserName = email,
            Email = email,
            CreatedAt = DateTime.UtcNow
        };

        var result = await _userManager.CreateAsync(user, password);

        return new CreateUserResult(
            result.Succeeded,
            user.Id,
            result.Errors.Select(e => e.Description).ToList());
    }

    public async Task<bool> CheckPasswordAsync(Guid userId, string password)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        return user is not null && await _userManager.CheckPasswordAsync(user, password);
    }
}
