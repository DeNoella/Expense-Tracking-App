namespace BackEnd.Entities
{
    public class Otp : BaseEntity
    {
        public Guid UserId { get; set; }
        public Users User { get; set; } = null!;

        public string Code { get; set; } = string.Empty;
        public string Purpose { get; set; } = string.Empty;
        public DateTime ExpiresAt { get; set; }
        public DateTime? ConsumedAt { get; set; }
    }
}

