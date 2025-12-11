using BackEnd.Models.Catalog;

namespace BackEnd.Models.Cart
{
    public class CartItemDto
    {
        public Guid ProductId { get; set; }
        public int Quantity { get; set; }
        
        // Product info (without CartItems collection)
        public ProductDto? Product { get; set; }
    }
}

