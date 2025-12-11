using BackEnd.Entities;

namespace BackEnd.Models.Catalog
{
    public class ProductDto
    {
        public Guid Id { get; set; }
        public ProductCategory Category { get; set; }
        public int CategoryId { get; set; } // For frontend compatibility
        public string Name { get; set; } = string.Empty;
        public string Sku { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public decimal? OriginalPrice { get; set; }
        public int StockQty { get; set; }
        public int Stock { get; set; } // Alias for StockQty for frontend compatibility
        public string? ImageUrl { get; set; }
        public string? Image { get; set; } // Alias for ImageUrl for frontend compatibility
        public string? Description { get; set; }
        public string? Brand { get; set; }
        public double Rating { get; set; }
        public int ReviewCount { get; set; }
        public string? Tags { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}




