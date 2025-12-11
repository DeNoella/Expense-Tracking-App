using System.ComponentModel.DataAnnotations;

namespace BackEnd.Entities
{
    public enum OrderStatus
    {
        Pending = 0,
        Paid = 1,
        Shipped = 2,
        InTransit = 3,
        Delivered = 4,
        Cancelled = 5
    }

    public class Order : BaseEntity
    {
        public Guid UserId { get; set; }
        public Users User { get; set; } = null!;

        [MaxLength(50)]
        public string OrderNumber { get; set; } = string.Empty;

        public OrderStatus Status { get; set; } = OrderStatus.Pending;

        public decimal Total { get; set; }

        [MaxLength(100)]
        public string? TrackingNumber { get; set; }

        public DateTime? EstimatedDelivery { get; set; }

        [MaxLength(200)]
        public string? ShippingAddressName { get; set; }

        [MaxLength(500)]
        public string? ShippingAddress { get; set; }

        [MaxLength(100)]
        public string? ShippingCity { get; set; }

        [MaxLength(100)]
        public string? ShippingCountry { get; set; }

        [MaxLength(20)]
        public string? ShippingPostalCode { get; set; }

        [MaxLength(20)]
        public string? ShippingPhone { get; set; }

        [MaxLength(500)]
        public string? ShippingInstructions { get; set; }

        public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
        public ICollection<Payment> Payments { get; set; } = new List<Payment>();
        public ICollection<Issue> Issues { get; set; } = new List<Issue>();
    }
}

