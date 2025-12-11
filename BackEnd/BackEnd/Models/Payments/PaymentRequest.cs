using BackEnd.Entities;

namespace BackEnd.Models.Payments
{
    public class PaymentRequest
    {
        public Guid OrderId { get; set; }
        public PaymentMethodType Method { get; set; }
        public decimal Amount { get; set; }
        public string? TransactionReference { get; set; }
    }
}

