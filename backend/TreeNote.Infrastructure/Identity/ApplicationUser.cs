using Microsoft.AspNetCore.Identity;

namespace TreeNote.Infrastructure.Identity;

public class ApplicationUser : IdentityUser<Guid>
{
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? DisplayName { get; set; }
}
