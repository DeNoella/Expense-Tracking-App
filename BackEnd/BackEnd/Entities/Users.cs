using System.ComponentModel.DataAnnotations;

namespace BackEnd.Entities
{
    public class Users : BaseEntity
    {
        [Required, EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string PasswordHash { get; set; } = string.Empty;

        public bool IsEmailVerified { get; set; }

        public string? FullName { get; set; }

        public bool IsTwoFactorEnabled { get; set; } = false;

        public string? TwoFactorMethod { get; set; } // "email" or "sms" (for future SMS support)

        // Simplified: Store permissions as comma-separated string (e.g., "product.read,product.write,order.view.any")
        public string? Permissions { get; set; }

        // Simplified: Store refresh token directly in user table (single session per user)
        public string? RefreshToken { get; set; }
        public DateTime? RefreshTokenExpiresAt { get; set; }
        public DateTime? RefreshTokenRevokedAt { get; set; }
        public Cart? Cart { get; set; }
        public ICollection<Order> Orders { get; set; } = new List<Order>();
        public ICollection<Issue> Issues { get; set; } = new List<Issue>();
    }
}
