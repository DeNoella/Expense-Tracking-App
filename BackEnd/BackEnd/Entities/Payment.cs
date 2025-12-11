namespace BackEnd.Entities
{
    public enum PaymentMethodType
    {
        Cash = 0,
        MoMo = 1,
        Card = 2,
        Online = 3
    }

    public enum PaymentStatus
    {
        Pending = 0,
        Completed = 1,
        Failed = 2
    }

    public class Payment : BaseEntity
    {
        public Guid OrderId { get; set; }
        public Order Order { get; set; } = null!;

        public PaymentMethodType Method { get; set; }

        public PaymentStatus Status { get; set; } = PaymentStatus.Pending;

        public decimal Amount { get; set; }

        public string? TransactionReference { get; set; }

        public DateTime? PaidAt { get; set; }
    }
}

