namespace BackEnd.Models.Auth
{
    public class Login2FAResponse
    {
        public bool RequiresTwoFactor { get; set; }
        public string? TwoFactorMethod { get; set; }
        public string? Message { get; set; }
        public TokenResponse? Token { get; set; } // Only if 2FA not required
    }
}

