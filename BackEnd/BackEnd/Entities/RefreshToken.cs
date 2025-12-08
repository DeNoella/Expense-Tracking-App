namespace BackEnd.Entities
{
    public class RefreshToken : BaseEntity
    {
        public Guid UserId { get; set; }
        public Users User { get; set; } = null!;

        public string Token { get; set; } = string.Empty;

        public DateTime ExpiresAt { get; set; }

        public DateTime? RevokedAt { get; set; }
    }
}

