using BackEnd.Entities;

namespace BackEnd.Models.Issues
{
    public class IssueUpdateRequest
    {
        public IssueStatus Status { get; set; }
        public string? AdminResponse { get; set; }
    }
}

