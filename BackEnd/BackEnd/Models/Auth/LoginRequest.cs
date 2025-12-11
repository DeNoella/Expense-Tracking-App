namespace BackEnd.Models.Auth
{
    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string? TwoFactorCode { get; set; } // Optional: OTP if 2FA is enabled
    }
}

