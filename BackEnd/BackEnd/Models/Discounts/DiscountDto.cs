using BackEnd.Entities;
using BackEnd.Models.Catalog;

namespace BackEnd.Models.Discounts
{
    public class DiscountDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public DiscountType Type { get; set; }
        public decimal Value { get; set; }
        public DiscountApplicableTo ApplicableTo { get; set; }
        public ProductCategory? Category { get; set; }
        public Guid? ProductId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public decimal? MinPurchase { get; set; }
        public decimal? MaxDiscount { get; set; }
        public DiscountStatus Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        
        // Related entities (without circular references)
        public ProductDto? Product { get; set; }
    }
}




