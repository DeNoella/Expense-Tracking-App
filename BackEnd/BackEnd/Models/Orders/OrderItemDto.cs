using BackEnd.Models.Catalog;

namespace BackEnd.Models.Orders
{
    public class OrderItemDto
    {
        public Guid Id { get; set; }
        public Guid ProductId { get; set; }
        public decimal UnitPrice { get; set; }
        public int Quantity { get; set; }
        public decimal LineTotal { get; set; }
        
        // Product info (without OrderItems collection)
        public ProductDto? Product { get; set; }
    }
}

