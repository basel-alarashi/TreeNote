using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using TreeNote.Application.Exceptions;
using TreeNote.Application.Interfaces;

namespace TreeNote.Infrastructure.Identity;

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }
    public Guid UserId
    {
        get
        {
            var idClaim = _httpContextAccessor.HttpContext?.User
                .FindFirstValue(ClaimTypes.NameIdentifier);

            return idClaim is not null && Guid.TryParse(idClaim, out var id)
                ? id
                : throw new UnauthorizedAccessException("No authenticated user found.");
        }
    }
}
