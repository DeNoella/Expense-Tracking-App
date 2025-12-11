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

        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken cancellationToken)
        {
            var response = await _authService.LoginAsync(request, cancellationToken);
            
            if (response.RequiresTwoFactor)
            {
                return Ok(response); // Return 2FA requirement
            }
            
            if (response.Token is null)
            {
                return Unauthorized(response.Message ?? "Invalid credentials or email not verified");
            }
            
            // Set httpOnly cookies for tokens
            SetTokenCookies(response.Token);
            
            // Return user info without tokens in response body
            return Ok(new
            {
                Email = response.Token.Email,
                Permissions = response.Token.Permissions,
                ExpiresAt = response.Token.ExpiresAt
            });
        }

        [HttpPost("verify-2fa")]
        [AllowAnonymous]
        public async Task<IActionResult> Verify2FA([FromBody] Verify2FARequest request, CancellationToken cancellationToken)
        {
            var token = await _authService.Verify2FAAsync(request, cancellationToken);
            if (token is null) return Unauthorized("Invalid or expired 2FA code");
            
            // Set httpOnly cookies for tokens
            SetTokenCookies(token);
            
            // Return user info without tokens in response body
            return Ok(new
            {
                Email = token.Email,
                Permissions = token.Permissions,
                ExpiresAt = token.ExpiresAt
            });
        }

        [HttpPost("refresh")]
        [AllowAnonymous]
        public async Task<IActionResult> Refresh(CancellationToken cancellationToken)
        {
            // Get refresh token from cookie
            var refreshToken = Request.Cookies["refreshToken"];
            if (string.IsNullOrEmpty(refreshToken))
            {
                return Unauthorized("Refresh token not found");
            }
            
            var token = await _authService.RefreshAsync(new RefreshRequest { RefreshToken = refreshToken }, cancellationToken);
            if (token is null) return Unauthorized("Invalid refresh token");
            
            // Set new httpOnly cookies for tokens
            SetTokenCookies(token);
            
            // Return user info without tokens in response body
            return Ok(new
            {
                Email = token.Email,
                Permissions = token.Permissions,
                ExpiresAt = token.ExpiresAt
            });
        }

        [HttpPost("logout")]
        [Authorize]
        public async Task<IActionResult> Logout(CancellationToken cancellationToken)
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            
            // Get refresh token from cookie
            var refreshToken = Request.Cookies["refreshToken"];
            if (!string.IsNullOrEmpty(refreshToken))
            {
                await _authService.LogoutAsync(userId, refreshToken, cancellationToken);
            }
            
            // Clear cookies
            ClearTokenCookies();
            
            return Ok(new { Message = "Logged out" });
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> Me(CancellationToken cancellationToken)
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            // Get user from database to include 2FA status and FullName
            var user = await _authService.GetUserByIdAsync(userId, cancellationToken);
            
            var permissions = User.Claims.Where(c => c.Type == "permission").Select(c => c.Value).ToList();
            var hasAdminPermissions = permissions.Contains("order.view.any") || 
                                     permissions.Any(p => p.Contains("admin") || p == "user.manage" || p == "user.view.any");
            
            return Ok(new
            {
                UserId = User.FindFirstValue(ClaimTypes.NameIdentifier),
                Email = User.FindFirstValue(ClaimTypes.Email),
                FullName = user?.FullName,
                Permissions = permissions,
                HasAdminPermissions = hasAdminPermissions,
                IsTwoFactorEnabled = user?.IsTwoFactorEnabled ?? false,
                TwoFactorMethod = user?.TwoFactorMethod
            });
        }

        [HttpPost("forgot-password")]
        [AllowAnonymous]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request, CancellationToken cancellationToken)
        {
            var success = await _authService.RequestPasswordResetAsync(request.Email, cancellationToken);
            // Always return success to prevent email enumeration
            return Ok(new { Message = "If the email exists, a password reset code has been sent." });
        }

        [HttpPost("reset-password")]
        [AllowAnonymous]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request, CancellationToken cancellationToken)
        {
            var success = await _authService.ResetPasswordAsync(request, cancellationToken);
            if (!success) return BadRequest("Invalid or expired reset code");
            return Ok(new { Message = "Password reset successfully" });
        }

        [HttpPost("enable-2fa")]
        [Authorize]
        public async Task<IActionResult> Enable2FA([FromBody] Enable2FARequest request, CancellationToken cancellationToken)
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var success = await _authService.Enable2FAAsync(userId, request, cancellationToken);
            if (!success) return BadRequest("Failed to enable 2FA. Make sure your email is verified.");
            return Ok(new { Message = "2FA enabled successfully" });
        }

        [HttpPost("disable-2fa")]
        [Authorize]
        public async Task<IActionResult> Disable2FA(CancellationToken cancellationToken)
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var success = await _authService.Disable2FAAsync(userId, cancellationToken);
            if (!success) return BadRequest("Failed to disable 2FA");
            return Ok(new { Message = "2FA disabled successfully" });
        }

        [HttpPost("resend-otp")]
        [AllowAnonymous]
        public async Task<IActionResult> ResendOtp([FromBody] ResendOtpRequest request, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState
                    .Where(x => x.Value?.Errors.Count > 0)
                    .SelectMany(x => x.Value!.Errors.Select(e => e.ErrorMessage))
                    .ToList();
                return BadRequest(new { message = "Validation failed", errors });
            }

            var success = await _authService.ResendOtpAsync(request.Email, cancellationToken);
            if (!success)
            {
                return BadRequest(new { message = "Unable to resend OTP. Email may already be verified or account does not exist." });
            }
            
            return Ok(new { Message = "Verification code has been resent to your email" });
        }


        private void SetTokenCookies(TokenResponse token)
        {
            // In development, allow cookies over HTTP (localhost)
            // In production, require HTTPS
            var isDevelopment = _environment?.IsDevelopment() ?? false;
            
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true, // Prevents JavaScript access (XSS protection)
                Secure = !isDevelopment, // Only send over HTTPS in production
                SameSite = SameSiteMode.Strict, // CSRF protection
                Expires = token.ExpiresAt,
                Path = "/"
            };

            // Set access token cookie
            Response.Cookies.Append("accessToken", token.AccessToken, cookieOptions);

            // Set refresh token cookie (longer expiry)
            var refreshCookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = !isDevelopment, // Only send over HTTPS in production
                SameSite = SameSiteMode.Strict,
                Expires = DateTime.UtcNow.AddDays(7), // Refresh token expires in 7 days
                Path = "/"
            };
            Response.Cookies.Append("refreshToken", token.RefreshToken, refreshCookieOptions);
        }

        private void ClearTokenCookies()
        {
            // In development, allow cookies over HTTP (localhost)
            // In production, require HTTPS
            var isDevelopment = _environment?.IsDevelopment() ?? false;
            
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = !isDevelopment, // Only send over HTTPS in production
                SameSite = SameSiteMode.Strict,
                Expires = DateTime.UtcNow.AddDays(-1), // Expire immediately
                Path = "/"
            };

            Response.Cookies.Append("accessToken", "", cookieOptions);
            Response.Cookies.Append("refreshToken", "", cookieOptions);
        }
    }
}
