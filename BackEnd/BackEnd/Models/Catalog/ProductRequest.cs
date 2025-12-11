using BackEnd.Entities;

namespace BackEnd.Models.Catalog
{
    public class ProductRequest
    {
        public ProductCategory? Category { get; set; }
        public int? CategoryId { get; set; } // For frontend compatibility - will be converted to Category
        public string Name { get; set; } = string.Empty;
        public string Sku { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public decimal? OriginalPrice { get; set; }
        public int StockQty { get; set; }
        public string? ImageUrl { get; set; }
        public string? Description { get; set; }
        public string? Brand { get; set; }
        public decimal Rating { get; set; } = 0;
        public int ReviewCount { get; set; } = 0;
        public string? Tags { get; set; } // Comma-separated or JSON array
        public bool IsActive { get; set; } = true;
    }
}

