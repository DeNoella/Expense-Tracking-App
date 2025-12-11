using BackEnd.Entities;
using BackEnd.Models.Auth;
using BackEnd.Models.Catalog;
using BackEnd.Models.Orders;

namespace BackEnd.Models.Issues
{
    public class IssueDto
    {
        public Guid Id { get; set; }
        public Guid OrderId { get; set; }
        public Guid? OrderItemId { get; set; }
        public Guid? ProductId { get; set; }
        public Guid UserId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? Reason { get; set; }
        public decimal? Amount { get; set; }
        public IssueStatus Status { get; set; }
        public string? AdminResponse { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        
        // Related entities (without circular references)
        public OrderDto? Order { get; set; }
        public ProductDto? Product { get; set; }
        public UserDto? User { get; set; }
    }
}





