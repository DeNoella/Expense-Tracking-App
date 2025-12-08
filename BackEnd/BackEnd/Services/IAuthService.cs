using BackEnd.Entities;
using BackEnd.Models.Auth;

namespace BackEnd.Services
{
    public interface IAuthService
    {
        Task<Users> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default);
        Task<bool> VerifyEmailAsync(VerifyEmailRequest request, CancellationToken cancellationToken = default);
        Task<TokenResponse?> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default);
        Task<TokenResponse?> RefreshAsync(RefreshRequest request, CancellationToken cancellationToken = default);
        Task<bool> LogoutAsync(Guid userId, string refreshToken, CancellationToken cancellationToken = default);
    }
}

