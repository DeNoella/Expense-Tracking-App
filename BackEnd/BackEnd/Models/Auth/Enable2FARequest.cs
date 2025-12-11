namespace BackEnd.Models.Auth
{
    public class Enable2FARequest
    {
        public string Method { get; set; } = "email"; // "email" or "sms"
    }
}

