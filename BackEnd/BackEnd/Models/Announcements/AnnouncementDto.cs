using BackEnd.Entities;

namespace BackEnd.Models.Announcements
{
    public class AnnouncementDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public AnnouncementType Type { get; set; }
        public AnnouncementStatus Status { get; set; }
        public AnnouncementVisibility Visibility { get; set; }
        public AnnouncementPriority Priority { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public bool Dismissible { get; set; }
        public string? CreatedBy { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}





