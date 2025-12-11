using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BackEnd.Entities
{
    public enum IssueStatus
    {
        Open = 0,
        Responded = 1,
        Resolved = 2,
        Closed = 3,
        Approved = 4,
        Rejected = 5
    }

    public class Issue : BaseEntity
    {
        public Guid OrderId { get; set; }
        public Order Order { get; set; } = null!;

        public Guid? OrderItemId { get; set; }
        public OrderItem? OrderItem { get; set; }

        public Guid? ProductId { get; set; }
        public Product? Product { get; set; }

        public Guid UserId { get; set; }
        public Users User { get; set; } = null!;

        [Required]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        [MaxLength(200)]
        public string? Reason { get; set; } // e.g., "Defective Product", "Wrong Item", etc.

        [Column(TypeName = "decimal(18,2)")]
        public decimal? Amount { get; set; } // Refund amount

        public IssueStatus Status { get; set; } = IssueStatus.Open;
        public string? AdminResponse { get; set; }
    }
}

