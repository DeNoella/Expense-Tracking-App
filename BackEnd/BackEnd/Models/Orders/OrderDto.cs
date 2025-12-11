using BackEnd.Entities;
using BackEnd.Models.Auth;
using BackEnd.Models.Payments;

namespace BackEnd.Models.Orders
{
    public class OrderDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string OrderNumber { get; set; } = string.Empty;
        public OrderStatus Status { get; set; }
        public decimal Total { get; set; }
        public string? TrackingNumber { get; set; }
        public DateTime? EstimatedDelivery { get; set; }
        public string? ShippingAddressName { get; set; }
        public string? ShippingAddress { get; set; }
        public string? ShippingCity { get; set; }
        public string? ShippingCountry { get; set; }
        public string? ShippingPostalCode { get; set; }
        public string? ShippingPhone { get; set; }
        public string? ShippingInstructions { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        
        // User info (without Orders collection)
        public UserDto? User { get; set; }
        
        // Order items (without Order reference)
        public List<OrderItemDto> Items { get; set; } = new();
        
        // Payments (without Order reference)
        public List<PaymentDto> Payments { get; set; } = new();
    }
}

