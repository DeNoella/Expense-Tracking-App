using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using BackEnd.Authorization;
using BackEnd.Data;
using BackEnd.Entities;
using BackEnd.Models.Auth;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace BackEnd.Services
{
    public class AuthService : IAuthService
    {
        private readonly BuyPointDbContext _dbContext;
        private readonly IPasswordHasher<Users> _passwordHasher;
        private readonly IConfiguration _configuration;
        private readonly ILogger<AuthService> _logger;
        private readonly IEmailService _emailService;
        private readonly IMemoryCache _cache;

        public AuthService(
            BuyPointDbContext dbContext,
            IPasswordHasher<Users> passwordHasher,
            IConfiguration configuration,
            ILogger<AuthService> logger,
            IEmailService emailService,
            IMemoryCache cache)
        {
            _dbContext = dbContext;
            _passwordHasher = passwordHasher;
            _configuration = configuration;
            _logger = logger;
            _emailService = emailService;
            _cache = cache;
        }

        public async Task<Users> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default)
        {
            var existing = await _dbContext.Users.AsNoTracking()
                .FirstOrDefaultAsync(u => u.Email == request.Email, cancellationToken);
            if (existing is not null)
            {
                throw new InvalidOperationException("Email already registered.");
            }

            var user = new Users
            {
                Email = request.Email,
                FullName = request.FullName ?? string.Empty,
                IsEmailVerified = false
            };

            user.PasswordHash = _passwordHasher.HashPassword(user, request.Password);

            _dbContext.Users.Add(user);
            
            // Save user first to get the ID
            await _dbContext.SaveChangesAsync(cancellationToken);

            // Set default customer permissions as comma-separated string
            user.Permissions = string.Join(",", PermissionConstants.DefaultCustomerPermissions);
            
            // Save user with permissions
            await _dbContext.SaveChangesAsync(cancellationToken);

            // Generate OTP and store in cache (not database)
            var otpCode = GenerateOtpCode();
            // Normalize email to lowercase for consistent cache key lookup
            var normalizedEmail = request.Email.Trim().ToLowerInvariant();
            var cacheKey = $"otp:{normalizedEmail}:email_verification";
            
            // Store OTP in cache with 5-minute expiration
            var cacheOptions = new MemoryCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5),
                SlidingExpiration = null // Don't extend expiration on access
            };

            _cache.Set(cacheKey, new OtpCacheEntry
            {
                Code = otpCode,
                UserId = user.Id,
                Email = normalizedEmail,
                CreatedAt = DateTime.UtcNow
            }, cacheOptions);

            // Send email in background - don't fail registration if email fails
            try
            {
                await _emailService.SendOtpAsync(user.Email, otpCode, cancellationToken);
                _logger.LogInformation("OTP generated for {Email} and stored in cache", user.Email);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send OTP email to {Email}, but user is registered. OTP is in cache.", user.Email);
                // Don't throw - user is registered, they can request a new OTP if needed
            }

            return user;
        }

        public async Task<bool> VerifyEmailAsync(VerifyEmailRequest request, CancellationToken cancellationToken = default)
        {
            // Normalize email and OTP (trim whitespace, case-insensitive for email)
            var normalizedEmail = request.Email.Trim().ToLowerInvariant();
            var normalizedOtp = request.Otp.Trim();
            
            var cacheKey = $"otp:{normalizedEmail}:email_verification";

            // Try to get OTP from cache
            if (!_cache.TryGetValue(cacheKey, out OtpCacheEntry? otpEntry) || otpEntry is null)
            {
                _logger.LogWarning("OTP not found or expired for {Email}", normalizedEmail);
                return false;
            }

            // Verify OTP code (case-sensitive, but trimmed)
            if (otpEntry.Code.Trim() != normalizedOtp)
            {
                _logger.LogWarning("Invalid OTP code for {Email}. Expected: {Expected}, Got: {Got}", 
                    normalizedEmail, otpEntry.Code, normalizedOtp);
                return false;
            }

            // Get user from database
            var user = await _dbContext.Users
                .FirstOrDefaultAsync(u => u.Id == otpEntry.UserId, cancellationToken);

            if (user is null)
            {
                return false;
            }

            // Verify email and remove OTP from cache
            user.IsEmailVerified = true;
            user.UpdatedAt = DateTime.UtcNow;
            _cache.Remove(cacheKey); // Remove OTP after successful verification

            await _dbContext.SaveChangesAsync(cancellationToken);
            _logger.LogInformation("Email verified for {Email}", request.Email);
            return true;
        }

        public async Task<Login2FAResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
        {
            var user = await _dbContext.Users
                .FirstOrDefaultAsync(u => u.Email == request.Email, cancellationToken);

            if (user is null)
            {
                return new Login2FAResponse { RequiresTwoFactor = false, Message = "Invalid credentials" };
            }

            var passwordResult = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
            if (passwordResult == PasswordVerificationResult.Failed)
            {
                return new Login2FAResponse { RequiresTwoFactor = false, Message = "Invalid credentials" };
            }

            if (!user.IsEmailVerified)
            {
                return new Login2FAResponse { RequiresTwoFactor = false, Message = "Email not verified" };
            }

            // Check if 2FA is enabled
            if (user.IsTwoFactorEnabled)
            {
                // If 2FA code is provided, verify it
                if (!string.IsNullOrWhiteSpace(request.TwoFactorCode))
                {
                    var cacheKey = $"otp:{request.Email}:2fa_login";
                    if (!_cache.TryGetValue(cacheKey, out OtpCacheEntry? otpEntry) || otpEntry is null)
                    {
                        return new Login2FAResponse { RequiresTwoFactor = true, TwoFactorMethod = user.TwoFactorMethod, Message = "Invalid or expired 2FA code" };
                    }

                    if (otpEntry.Code != request.TwoFactorCode)
                    {
                        return new Login2FAResponse { RequiresTwoFactor = true, TwoFactorMethod = user.TwoFactorMethod, Message = "Invalid 2FA code" };
                    }

                    // 2FA verified, create tokens
                    _cache.Remove(cacheKey);
                    var token = await CreateTokensAsync(user, cancellationToken);
                    return new Login2FAResponse { RequiresTwoFactor = false, Token = token };
                }
                else
                {
                    // 2FA enabled but no code provided, send OTP
                    var otpCode = GenerateOtpCode();
                    var cacheKey = $"otp:{request.Email}:2fa_login";
                    
                    var cacheOptions = new MemoryCacheEntryOptions
                    {
                        AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5)
                    };

                    _cache.Set(cacheKey, new OtpCacheEntry
                    {
                        Code = otpCode,
                        UserId = user.Id,
                        Email = user.Email,
                        CreatedAt = DateTime.UtcNow
                    }, cacheOptions);

                    // Send 2FA OTP based on method
                    if (user.TwoFactorMethod == "email")
                    {
                        await _emailService.Send2FAOtpAsync(user.Email, otpCode, cancellationToken);
                    }
                    // Future: Add SMS support here

                    return new Login2FAResponse
                    {
                        RequiresTwoFactor = true,
                        TwoFactorMethod = user.TwoFactorMethod,
                        Message = $"2FA code sent to your {user.TwoFactorMethod}"
                    };
                }
            }

            // No 2FA, login directly
            var tokens = await CreateTokensAsync(user, cancellationToken);
            return new Login2FAResponse { RequiresTwoFactor = false, Token = tokens };
        }

        public async Task<TokenResponse?> Verify2FAAsync(Verify2FARequest request, CancellationToken cancellationToken = default)
        {
            var cacheKey = $"otp:{request.Email}:2fa_login";
            
            if (!_cache.TryGetValue(cacheKey, out OtpCacheEntry? otpEntry) || otpEntry is null)
            {
                return null;
            }

            if (otpEntry.Code != request.Otp)
            {
                return null;
            }

            var user = await _dbContext.Users
                .FirstOrDefaultAsync(u => u.Id == otpEntry.UserId, cancellationToken);

            if (user is null || !user.IsTwoFactorEnabled)
            {
                return null;
            }

            _cache.Remove(cacheKey);
            return await CreateTokensAsync(user, cancellationToken);
        }

        public async Task<TokenResponse?> RefreshAsync(RefreshRequest request, CancellationToken cancellationToken = default)
        {
            // Find user by refresh token stored in Users table
            var user = await _dbContext.Users
                .FirstOrDefaultAsync(u => u.RefreshToken == request.RefreshToken, cancellationToken);

            if (user is null || 
                user.RefreshTokenRevokedAt is not null || 
                !user.RefreshTokenExpiresAt.HasValue ||
                user.RefreshTokenExpiresAt.Value <= DateTime.UtcNow)
            {
                return null;
            }

            return await CreateTokensAsync(user, cancellationToken);
        }

        public async Task<bool> LogoutAsync(Guid userId, string refreshToken, CancellationToken cancellationToken = default)
        {
            var user = await _dbContext.Users
                .FirstOrDefaultAsync(u => u.Id == userId && u.RefreshToken == refreshToken, cancellationToken);

            if (user is null)
            {
                return false;
            }

            // Revoke refresh token by setting RevokedAt
            user.RefreshTokenRevokedAt = DateTime.UtcNow;
            await _dbContext.SaveChangesAsync(cancellationToken);
            return true;
        }

        // Simplified: Permissions are now stored as comma-separated string in Users.Permissions
        // This method is kept for compatibility but now just sets the string
        private void SetPermissions(Users user, IEnumerable<string> permissions)
        {
            user.Permissions = string.Join(",", permissions.Distinct());
        }

        private async Task<TokenResponse> CreateTokensAsync(Users user, CancellationToken cancellationToken)
        {
            // Get permissions from comma-separated string
            var perms = string.IsNullOrEmpty(user.Permissions) 
                ? new List<string>() 
                : user.Permissions.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList();

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            claims.AddRange(perms.Select(p => new Claim(PermissionConstants.ClaimType, p.Trim())));

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["AppSettings:Token"]!));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var expires = DateTime.UtcNow.AddMinutes(30);
            var token = new JwtSecurityToken(
                issuer: _configuration["AppSettings:Issuer"],
                audience: _configuration["AppSettings:Audience"],
                claims: claims,
                expires: expires,
                signingCredentials: credentials);

            var accessToken = new JwtSecurityTokenHandler().WriteToken(token);

            // Store refresh token directly in Users table
            var refreshToken = GenerateRefreshToken();
            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiresAt = DateTime.UtcNow.AddDays(7);
            user.RefreshTokenRevokedAt = null; // Clear any previous revocation

            await _dbContext.SaveChangesAsync(cancellationToken);

            return new TokenResponse
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                ExpiresAt = expires,
                Email = user.Email,
                Permissions = perms
            };
        }

        private static string GenerateOtpCode()
        {
            var rng = RandomNumberGenerator.Create();
            var bytes = new byte[4];
            rng.GetBytes(bytes);
            var code = BitConverter.ToUInt32(bytes, 0) % 1_000_000;
            return code.ToString("D6");
        }

        public async Task<bool> RequestPasswordResetAsync(string email, CancellationToken cancellationToken = default)
        {
            var user = await _dbContext.Users
                .FirstOrDefaultAsync(u => u.Email == email, cancellationToken);

            // Don't reveal if email exists (security best practice)
            if (user is null)
            {
                return true;
            }

            // Generate OTP
            var otpCode = GenerateOtpCode();
            var cacheKey = $"otp:{email}:password_reset";
            
            // Store in cache (10 minutes for password reset)
            var cacheOptions = new MemoryCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(10)
            };

            _cache.Set(cacheKey, new OtpCacheEntry
            {
                Code = otpCode,
                UserId = user.Id,
                Email = user.Email,
                CreatedAt = DateTime.UtcNow
            }, cacheOptions);

            await _emailService.SendPasswordResetOtpAsync(user.Email, otpCode, cancellationToken);
            _logger.LogInformation("Password reset OTP generated for {Email}", email);
            return true;
        }

        public async Task<bool> ResetPasswordAsync(ResetPasswordRequest request, CancellationToken cancellationToken = default)
        {
            var cacheKey = $"otp:{request.Email}:password_reset";
            
            // Verify OTP
            if (!_cache.TryGetValue(cacheKey, out OtpCacheEntry? otpEntry) || otpEntry is null)
            {
                _logger.LogWarning("Invalid or expired password reset OTP for {Email}", request.Email);
                return false;
            }

            if (otpEntry.Code != request.Otp)
            {
                _logger.LogWarning("Invalid password reset OTP code for {Email}", request.Email);
                return false;
            }

            // Get user and update password
            var user = await _dbContext.Users
                .FirstOrDefaultAsync(u => u.Id == otpEntry.UserId, cancellationToken);
            
            if (user is null)
            {
                return false;
            }

            user.PasswordHash = _passwordHasher.HashPassword(user, request.NewPassword);
            user.UpdatedAt = DateTime.UtcNow;
            
            // Remove OTP from cache
            _cache.Remove(cacheKey);
            
            await _dbContext.SaveChangesAsync(cancellationToken);
            _logger.LogInformation("Password reset successful for {Email}", request.Email);
            return true;
        }

        public async Task<bool> Enable2FAAsync(Guid userId, Enable2FARequest request, CancellationToken cancellationToken = default)
        {
            var user = await _dbContext.Users
                .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);

            if (user is null)
            {
                return false;
            }

            if (!user.IsEmailVerified)
            {
                return false; // Must verify email first
            }

            // Validate method
            if (request.Method != "email" && request.Method != "sms")
            {
                return false;
            }

            // For now, only email is supported
            if (request.Method == "sms")
            {
                return false; // SMS not implemented yet
            }

            user.IsTwoFactorEnabled = true;
            user.TwoFactorMethod = request.Method;
            user.UpdatedAt = DateTime.UtcNow;

            await _dbContext.SaveChangesAsync(cancellationToken);
            _logger.LogInformation("2FA enabled for user {UserId} with method {Method}", userId, request.Method);
            return true;
        }

        public async Task<bool> Disable2FAAsync(Guid userId, CancellationToken cancellationToken = default)
        {
            var user = await _dbContext.Users
                .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);

            if (user is null)
            {
                return false;
            }

            user.IsTwoFactorEnabled = false;
            user.TwoFactorMethod = null;
            user.UpdatedAt = DateTime.UtcNow;

            await _dbContext.SaveChangesAsync(cancellationToken);
            _logger.LogInformation("2FA disabled for user {UserId}", userId);
            return true;
        }

        public async Task<Users?> GetUserByIdAsync(Guid userId, CancellationToken cancellationToken = default)
        {
            return await _dbContext.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);
        }

        public async Task<bool> ResendOtpAsync(string email, CancellationToken cancellationToken = default)
        {
            // Normalize email
            var normalizedEmail = email.Trim().ToLowerInvariant();
            
            // Check if user exists and is not verified
            var user = await _dbContext.Users
                .FirstOrDefaultAsync(u => u.Email == normalizedEmail, cancellationToken);

            if (user is null)
            {
                // Don't reveal if email exists (security best practice)
                _logger.LogWarning("Resend OTP requested for non-existent email: {Email}", normalizedEmail);
                return true; // Return true to prevent email enumeration
            }

            // Only allow resend if email is not verified
            if (user.IsEmailVerified)
            {
                _logger.LogWarning("Resend OTP requested for already verified email: {Email}", normalizedEmail);
                return false;
            }

            // Generate new OTP
            var otpCode = GenerateOtpCode();
            var cacheKey = $"otp:{normalizedEmail}:email_verification";
            
            // Store OTP in cache with 5-minute expiration
            var cacheOptions = new MemoryCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5),
                SlidingExpiration = null
            };

            _cache.Set(cacheKey, new OtpCacheEntry
            {
                Code = otpCode,
                UserId = user.Id,
                Email = normalizedEmail,
                CreatedAt = DateTime.UtcNow
            }, cacheOptions);

            // Send email
            try
            {
                await _emailService.SendOtpAsync(user.Email, otpCode, cancellationToken);
                _logger.LogInformation("OTP resent for {Email}", user.Email);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to resend OTP email to {Email}", user.Email);
                return false;
            }
        }

        private static string GenerateRefreshToken()
        {
            return Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
        }

        // Cache entry model for OTP
        private class OtpCacheEntry
        {
            public string Code { get; set; } = string.Empty;
            public Guid UserId { get; set; }
            public string Email { get; set; } = string.Empty;
            public DateTime CreatedAt { get; set; }
        }
    }
}
