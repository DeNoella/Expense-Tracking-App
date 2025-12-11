namespace BackEnd.Models.Orders
{
    public class CheckoutRequest
    {
        public string? Notes { get; set; }
        
        // Shipping Address
        public string? ShippingAddressName { get; set; }
        public string? ShippingAddress { get; set; }
        public string? ShippingCity { get; set; }
        public string? ShippingCountry { get; set; }
        public string? ShippingPostalCode { get; set; }
        public string? ShippingPhone { get; set; }
        public string? ShippingInstructions { get; set; }
    }
}

