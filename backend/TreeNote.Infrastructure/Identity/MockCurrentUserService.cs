using TreeNote.Application.Interfaces;

namespace TreeNote.Infrastructure.Identity;

/// <summary>
/// Temporary stand-in for real authentication. Returns a fixed, seeded user id
/// so Workspace/Canvas/Topic ownership can be tested end-to-end before Sprint 4
/// wires JWT auth. Sprint 4 replaces this with an implementation that reads
/// the user id from HttpContext.User claims — nothing else in the app changes.
/// </summary>
public class MockCurrentUserService : ICurrentUserService
{
    public static readonly Guid MockUserId = Guid.Parse("11111111-1111-1111-1111-111111111111");

    public Guid UserId => MockUserId;
}
