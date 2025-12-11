using System.ComponentModel.DataAnnotations;

namespace BackEnd.Entities
{
    public class PaymentMethod : BaseEntity
    {
        [Required, MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required, MaxLength(50)]
        public string Code { get; set; } = string.Empty; // e.g., "cod", "bank", "momo"

        [MaxLength(500)]
        public string? Description { get; set; }

        [MaxLength(100)]
        public string? Icon { get; set; } // Icon name or identifier

        public bool IsActive { get; set; } = true;
    }
}

