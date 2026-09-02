using MediatR;
using Microsoft.AspNetCore.Mvc;
using TreeNote.Api.Configuration;
using TreeNote.Application.Commands.GoogleLogin;
using TreeNote.Application.Commands.Login;
using TreeNote.Application.Commands.Logout;
using TreeNote.Application.Commands.RefreshToken;
using TreeNote.Application.Commands.Register;
using TreeNote.Application.DTOs;

namespace TreeNote.Api.Controllers;

[ApiController]
[Route("api/v1/auth")]
public class AuthController : ControllerBase
{
    private readonly ISender _mediator;
    private readonly IWebHostEnvironment _env;

    public AuthController(ISender mediator, IWebHostEnvironment env)
    {
        _mediator = mediator;
        _env = env;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterCommand command)
    {
        // Register never logs the user in — no tokens to cookie/return here.
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(BuildAuthResponse(result));
    }

    [HttpPost("google")]
    public async Task<IActionResult> GoogleLogin(GoogleLoginCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(BuildAuthResponse(result));
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh()
    {
        var refreshToken = Request.Cookies[RefreshTokenCookie.Name];
        if (string.IsNullOrEmpty(refreshToken))
            return Unauthorized(new { status = 401, title = "No refresh token was supplied." });

        var result = await _mediator.Send(new RefreshTokenCommand(refreshToken));
        return Ok(BuildAuthResponse(result));
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        var refreshToken = Request.Cookies[RefreshTokenCookie.Name];
        if (!string.IsNullOrEmpty(refreshToken))
        {
            await _mediator.Send(new LogoutCommand(refreshToken));
        }

        Response.Cookies.Delete(RefreshTokenCookie.Name, RefreshTokenCookie.DeleteOptions(_env));
        return NoContent();
    }

    private object BuildAuthResponse(AuthResultDto result)
    {
        Response.Cookies.Append(
            RefreshTokenCookie.Name,
            result.RefreshToken,
            RefreshTokenCookie.Options(_env, result.RefreshTokenExpiresAt));

        return new { userId = result.UserId, email = result.Email, accessToken = result.AccessToken };
    }
}
