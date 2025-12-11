using BackEnd.Entities;
using BackEnd.Models.Auth;

namespace BackEnd.Services
{
    public interface IAuthService
    {
        Task<Users> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default);
        Task<bool> VerifyEmailAsync(VerifyEmailRequest request, CancellationToken cancellationToken = default);
        Task<Login2FAResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default);
        Task<TokenResponse?> Verify2FAAsync(Verify2FARequest request, CancellationToken cancellationToken = default);
        Task<TokenResponse?> RefreshAsync(RefreshRequest request, CancellationToken cancellationToken = default);
        Task<bool> LogoutAsync(Guid userId, string refreshToken, CancellationToken cancellationToken = default);
        Task<bool> RequestPasswordResetAsync(string email, CancellationToken cancellationToken = default);
        Task<bool> ResetPasswordAsync(ResetPasswordRequest request, CancellationToken cancellationToken = default);
        Task<bool> Enable2FAAsync(Guid userId, Enable2FARequest request, CancellationToken cancellationToken = default);
        Task<bool> Disable2FAAsync(Guid userId, CancellationToken cancellationToken = default);
        Task<Users?> GetUserByIdAsync(Guid userId, CancellationToken cancellationToken = default);
        Task<bool> ResendOtpAsync(string email, CancellationToken cancellationToken = default);
    }
}

