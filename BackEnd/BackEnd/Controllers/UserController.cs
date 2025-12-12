using System.Security.Claims;
using BackEnd.Models.Auth;
using BackEnd.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Hosting;

namespace BackEnd.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ILogger<AuthController>? _logger;
        private readonly IWebHostEnvironment? _environment;

        public AuthController(IAuthService authService, ILogger<AuthController>? logger = null, IWebHostEnvironment? environment = null)
        {
            _authService = authService;
            _logger = logger;
            _environment = environment;
        }
    }
}
[HttpPost("register")]
[AllowAnonymous]
public async Task<IActionResult> Register([FromBody] RegisterRequest request, CancellationToken cancellationToken)
{
    try
    {
        var user = await _authService.RegisterAsync(request, cancellationToken);
        return Ok(new { user.Email, user.Id, Message = "User registered. Check email for OTP." });
    }
    catch (InvalidOperationException ex)
    {
        return BadRequest(new { message = ex.Message });
    }
    catch (Exception ex)
    {
        _logger?.LogError(ex, "Error during user registration");
        return StatusCode(500, new { message = "An error occurred during registration. Please try again." });
    }
}

[HttpPost("verify-email")]
[AllowAnonymous]
public async Task<IActionResult> VerifyEmail([FromBody] VerifyEmailRequest request, CancellationToken cancellationToken)
{
    if (!ModelState.IsValid)
    {
        var errors = ModelState
            .Where(x => x.Value?.Errors.Count > 0)
            .SelectMany(x => x.Value!.Errors.Select(e => e.ErrorMessage))
            .ToList();
        return BadRequest(new { message = "Validation failed", errors });
    }

    var success = await _authService.VerifyEmailAsync(request, cancellationToken);
    if (!success)
    {
        return BadRequest(new { message = "Invalid or expired OTP" });
    }
    
    return Ok(new { Message = "Email verified" });
}
