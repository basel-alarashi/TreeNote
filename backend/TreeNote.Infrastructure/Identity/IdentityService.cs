using Microsoft.AspNetCore.Identity;
using TreeNote.Application.DTOs;
using TreeNote.Application.Interfaces;
using TreeNote.Application.Exceptions;

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

    public async Task<UserDto?> FindByLoginAsync(string provider, string providerKey)
    {
        var user = await _userManager.FindByLoginAsync(provider, providerKey);
        return user is null ? null : new UserDto(user.Id, user.Email!);
    }

    public async Task<ExternalLoginResult> GetOrCreateExternalUserAsync(
        string provider, string providerKey, string email)
    {
        // 1. Already linked? Straightforward return.
        var existingLogin = await _userManager.FindByLoginAsync(provider, providerKey);
        if (existingLogin is not null)
            return new ExternalLoginResult(new UserDto(existingLogin.Id, existingLogin.Email!), false, false);

        // 2. No link yet — does an account with this email already exist (e.g. registered via password)?
        var existingByEmail = await _userManager.FindByEmailAsync(email);
        if (existingByEmail is not null)
        {
            // Link the Google identity to the existing account.
            var linkResult = await _userManager.AddLoginAsync(
                existingByEmail, new UserLoginInfo(provider, providerKey, provider));

            if (!linkResult.Succeeded)
            {
                var errors = string.Join("; ", linkResult.Errors.Select(e => e.Description));
                throw new ConflictException($"Could not link Google account: {errors}");
            }

            return new ExternalLoginResult(new UserDto(existingByEmail.Id, existingByEmail.Email!), false, true);
        }

        // 3. Brand new user — create the account and link Google in one go.
        var newUser = new ApplicationUser
        {
            UserName = email,
            Email = email,
            EmailConfirmed = true, // Google already verified it
            CreatedAt = DateTime.UtcNow
        };

        var createResult = await _userManager.CreateAsync(newUser);
        if (!createResult.Succeeded)
        {
            var errors = string.Join("; ", createResult.Errors.Select(e => e.Description));
            throw new BusinessRuleException(errors);
        }

        await _userManager.AddLoginAsync(newUser, new UserLoginInfo(provider, providerKey, provider));

        return new ExternalLoginResult(new UserDto(newUser.Id, newUser.Email!), true, false);
    }
}
