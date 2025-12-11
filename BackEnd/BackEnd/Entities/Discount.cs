using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BackEnd.Entities
{
    public enum DiscountType
    {
        Percentage = 0,
        Fixed = 1
    }

    public enum DiscountApplicableTo
    {
        All = 0,
        Category = 1,
        Product = 2
    }

    public enum DiscountStatus
    {
        Active = 0,
        Scheduled = 1,
        Expired = 2,
        Inactive = 3
    }

    public class Discount : BaseEntity
    {
        [Required, MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        public DiscountType Type { get; set; } = DiscountType.Percentage;

        [Column(TypeName = "decimal(18,2)")]
        public decimal Value { get; set; }

        public DiscountApplicableTo ApplicableTo { get; set; } = DiscountApplicableTo.All;

        // Use enum for category instead of separate table
        public ProductCategory? Category { get; set; }

        public Guid? ProductId { get; set; }
        public Product? Product { get; set; }

        public DateTime StartDate { get; set; }

        public DateTime? EndDate { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? MinPurchase { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? MaxDiscount { get; set; }

        public DiscountStatus Status { get; set; } = DiscountStatus.Active;
    }
}

