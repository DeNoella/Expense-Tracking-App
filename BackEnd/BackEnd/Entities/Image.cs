using System.ComponentModel.DataAnnotations;

namespace BackEnd.Entities
{
    public class Image : BaseEntity
    {
        [Required, MaxLength(500)]
        public string FileName { get; set; } = string.Empty;

        [Required, MaxLength(1000)]
        public string FilePath { get; set; } = string.Empty; // Relative path on server

        [MaxLength(1000)]
        public string? Url { get; set; } // Full URL for accessing the image

        [MaxLength(100)]
        public string? ContentType { get; set; } // e.g., "image/jpeg", "image/png"

        public long FileSize { get; set; } // Size in bytes

        [MaxLength(500)]
        public string? AltText { get; set; } // For accessibility

        [MaxLength(200)]
        public string? Title { get; set; }

        // Link to product (if this image belongs to a product)
        public Guid? ProductId { get; set; }
        public Product? Product { get; set; }

        public bool IsPrimary { get; set; } = false; // Primary image for product
    }
}




