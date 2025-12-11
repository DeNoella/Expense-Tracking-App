namespace BackEnd.Models.Issues
{
    public class IssueRequest
    {
        public Guid OrderId { get; set; }
        public Guid? OrderItemId { get; set; }
        public Guid? ProductId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? Reason { get; set; }
        public decimal? Amount { get; set; }
    }
}

