using System.ComponentModel.DataAnnotations;

namespace BackEnd.Entities
{
    public class Category : BaseEntity
    {
        [Required, MaxLength(150)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Description { get; set; }

        [MaxLength(500)]
        public string? ImageUrl { get; set; }

        public bool IsActive { get; set; } = true;

        public ICollection<Product> Products { get; set; } = new List<Product>();
        public ICollection<Image> Images { get; set; } = new List<Image>();
    }
}

