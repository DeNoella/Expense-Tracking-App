using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace BackEnd.Services;

public class EmailService : IEmailService
{
    private readonly EmailSettings _settings;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IOptions<EmailSettings> options, ILogger<EmailService> logger)
    {
        _settings = options.Value;
        _logger = logger;
    }

    public async Task SendOtpAsync(string toEmail, string otpCode, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(_settings.Host) || string.IsNullOrWhiteSpace(_settings.UserName))
        {
            _logger.LogWarning("Email settings are not configured. Skipping OTP email for {Email}", toEmail);
            return;
        }

        var subject = "Your BuyPoint Verification Code";
        var body = $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background-color: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }}
        .content {{ background-color: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }}
        .otp-code {{ font-size: 32px; font-weight: bold; color: #4F46E5; text-align: center; padding: 20px; background-color: white; border: 2px dashed #4F46E5; border-radius: 5px; margin: 20px 0; letter-spacing: 5px; }}
        .footer {{ text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }}
        .warning {{ color: #dc2626; font-size: 14px; margin-top: 20px; }}
    </style>
</head>
<body>
    <div class=""container"">
        <div class=""header"">
            <h1>BuyPoint</h1>
        </div>
        <div class=""content"">
            <h2>Email Verification</h2>
            <p>Hello,</p>
            <p>Thank you for registering with BuyPoint! Please use the verification code below to verify your email address:</p>
            <div class=""otp-code"">{otpCode}</div>
            <p><strong>This code will expire in 5 minutes.</strong></p>
            <p>If you did not request this verification code, you can safely ignore this email.</p>
            <p class=""warning"">⚠️ Never share this code with anyone. BuyPoint staff will never ask for your verification code.</p>
        </div>
        <div class=""footer"">
            <p>This is an automated message from BuyPoint. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>";

        using var message = new MailMessage
        {
            From = new MailAddress(string.IsNullOrWhiteSpace(_settings.From) ? _settings.UserName : _settings.From),
            Subject = subject,
            Body = body,
            IsBodyHtml = true
        };
        message.To.Add(new MailAddress(toEmail));

        using var client = new SmtpClient(_settings.Host, _settings.Port)
        {
            EnableSsl = _settings.EnableSsl,
            Credentials = new NetworkCredential(_settings.UserName, _settings.Password)
        };

        try
        {
            await client.SendMailAsync(message, cancellationToken);
            _logger.LogInformation("Sent OTP email to {Email}", toEmail);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send OTP email to {Email}", toEmail);
        }
    }

    public async Task SendPasswordResetOtpAsync(string toEmail, string otpCode, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(_settings.Host) || string.IsNullOrWhiteSpace(_settings.UserName))
        {
            _logger.LogWarning("Email settings are not configured. Skipping password reset OTP email for {Email}", toEmail);
            return;
        }

        var subject = "Your BuyPoint Password Reset Code";
        var body = $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background-color: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }}
        .content {{ background-color: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }}
        .otp-code {{ font-size: 32px; font-weight: bold; color: #dc2626; text-align: center; padding: 20px; background-color: white; border: 2px dashed #dc2626; border-radius: 5px; margin: 20px 0; letter-spacing: 5px; }}
        .footer {{ text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }}
        .warning {{ color: #dc2626; font-size: 14px; margin-top: 20px; }}
        .button {{ display: inline-block; padding: 12px 24px; background-color: #dc2626; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }}
    </style>
</head>
<body>
    <div class=""container"">
        <div class=""header"">
            <h1>Password Reset Request</h1>
        </div>
        <div class=""content"">
            <h2>Reset Your Password</h2>
            <p>Hello,</p>
            <p>We received a request to reset your password for your BuyPoint account. Use the verification code below to proceed:</p>
            <div class=""otp-code"">{otpCode}</div>
            <p><strong>This code will expire in 10 minutes.</strong></p>
            <p>If you did not request a password reset, please ignore this email and your password will remain unchanged.</p>
            <p class=""warning"">⚠️ If you didn't request this password reset, please secure your account immediately by changing your password.</p>
        </div>
        <div class=""footer"">
            <p>This is an automated message from BuyPoint. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>";

        using var message = new MailMessage
        {
            From = new MailAddress(string.IsNullOrWhiteSpace(_settings.From) ? _settings.UserName : _settings.From),
            Subject = subject,
            Body = body,
            IsBodyHtml = true
        };
        message.To.Add(new MailAddress(toEmail));

        using var client = new SmtpClient(_settings.Host, _settings.Port)
        {
            EnableSsl = _settings.EnableSsl,
            Credentials = new NetworkCredential(_settings.UserName, _settings.Password)
        };

        try
        {
            await client.SendMailAsync(message, cancellationToken);
            _logger.LogInformation("Sent password reset OTP email to {Email}", toEmail);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send password reset OTP email to {Email}", toEmail);
        }
    }

    public async Task Send2FAOtpAsync(string toEmail, string otpCode, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(_settings.Host) || string.IsNullOrWhiteSpace(_settings.UserName))
        {
            _logger.LogWarning("Email settings are not configured. Skipping 2FA OTP email for {Email}", toEmail);
            return;
        }

        var subject = "Your BuyPoint Two-Factor Authentication Code";
        var body = $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background-color: #059669; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }}
        .content {{ background-color: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }}
        .otp-code {{ font-size: 32px; font-weight: bold; color: #059669; text-align: center; padding: 20px; background-color: white; border: 2px dashed #059669; border-radius: 5px; margin: 20px 0; letter-spacing: 5px; }}
        .footer {{ text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }}
        .warning {{ color: #dc2626; font-size: 14px; margin-top: 20px; }}
    </style>
</head>
<body>
    <div class=""container"">
        <div class=""header"">
            <h1>🔐 Two-Factor Authentication</h1>
        </div>
        <div class=""content"">
            <h2>Login Verification</h2>
            <p>Hello,</p>
            <p>Someone is trying to log in to your BuyPoint account. Use the verification code below to complete the login:</p>
            <div class=""otp-code"">{otpCode}</div>
            <p><strong>This code will expire in 5 minutes.</strong></p>
            <p class=""warning"">⚠️ If you did not attempt to log in, please secure your account immediately by changing your password and enabling additional security measures.</p>
        </div>
        <div class=""footer"">
            <p>This is an automated message from BuyPoint. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>";

        using var message = new MailMessage
        {
            From = new MailAddress(string.IsNullOrWhiteSpace(_settings.From) ? _settings.UserName : _settings.From),
            Subject = subject,
            Body = body,
            IsBodyHtml = true
        };
        message.To.Add(new MailAddress(toEmail));

        using var client = new SmtpClient(_settings.Host, _settings.Port)
        {
            EnableSsl = _settings.EnableSsl,
            Credentials = new NetworkCredential(_settings.UserName, _settings.Password)
        };

        try
        {
            await client.SendMailAsync(message, cancellationToken);
            _logger.LogInformation("Sent 2FA OTP email to {Email}", toEmail);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send 2FA OTP email to {Email}", toEmail);
        }
    }
}

