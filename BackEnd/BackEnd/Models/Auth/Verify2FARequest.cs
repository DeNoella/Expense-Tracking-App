namespace BackEnd.Models.Auth
{
    public class Verify2FARequest
    {
        public string Email { get; set; } = string.Empty;
        public string Otp { get; set; } = string.Empty;
    }
}

