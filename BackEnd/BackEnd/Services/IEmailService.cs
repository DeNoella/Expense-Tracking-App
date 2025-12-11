using System.Threading;
using System.Threading.Tasks;

namespace BackEnd.Services;

public interface IEmailService
{
    Task SendOtpAsync(string toEmail, string otpCode, CancellationToken cancellationToken = default);
    Task SendPasswordResetOtpAsync(string toEmail, string otpCode, CancellationToken cancellationToken = default);
    Task Send2FAOtpAsync(string toEmail, string otpCode, CancellationToken cancellationToken = default);
}

