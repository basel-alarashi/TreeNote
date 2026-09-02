namespace TreeNote.Api.Configuration;

public static class RefreshTokenCookie
{
    public const string Name = "treenote_refresh_token";

    public static CookieOptions Options(IWebHostEnvironment env, DateTime expiresUtc) => new()
    {
        HttpOnly = true,
        Secure = !env.IsDevelopment(),
        SameSite = SameSiteMode.Strict,
        Path = "/api/v1/auth",
        Expires = expiresUtc
    };

    public static CookieOptions DeleteOptions(IWebHostEnvironment env) => new()
    {
        HttpOnly = true,
        Secure = !env.IsDevelopment(),
        SameSite = SameSiteMode.Strict,
        Path = "/api/v1/auth"
    };
}
