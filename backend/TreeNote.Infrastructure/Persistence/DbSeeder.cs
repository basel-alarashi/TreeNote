using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using TreeNote.Infrastructure.Identity;

namespace TreeNote.Infrastructure.Persistence;

public static class DbSeeder
{
    public static async Task SeedMockUserAsync(IServiceProvider services)
    {
        var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();

        var existing = await userManager.FindByIdAsync(MockCurrentUserService.MockUserId.ToString());
        if (existing is not null) return;

        var mockUser = new ApplicationUser
        {
            Id = MockCurrentUserService.MockUserId,
            UserName = "mockuser@treenote.dev",
            Email = "mockuser@treenote.dev",
            EmailConfirmed = true,
        };

        await userManager.CreateAsync(mockUser, "MockPassword123!");
    }
}
