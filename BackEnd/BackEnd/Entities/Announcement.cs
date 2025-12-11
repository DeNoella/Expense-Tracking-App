using System.ComponentModel.DataAnnotations;

namespace BackEnd.Entities
{
    public enum AnnouncementType
    {
        Info = 0,
        Success = 1,
        Warning = 2,
        Error = 3
    }

    public enum AnnouncementStatus
    {
        Active = 0,
        Scheduled = 1,
        Expired = 2,
        Inactive = 3
    }

    public enum AnnouncementVisibility
    {
        Public = 0,
        Authenticated = 1,
        Admin = 2
    }

    public enum AnnouncementPriority
    {
        Low = 0,
        Medium = 1,
        High = 2
    }

    public class Announcement : BaseEntity
    {
        [Required, MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required, MaxLength(1000)]
        public string Message { get; set; } = string.Empty;

        public AnnouncementType Type { get; set; } = AnnouncementType.Info;

        public AnnouncementStatus Status { get; set; } = AnnouncementStatus.Active;

        public AnnouncementVisibility Visibility { get; set; } = AnnouncementVisibility.Public;

        public AnnouncementPriority Priority { get; set; } = AnnouncementPriority.Medium;

        public DateTime StartDate { get; set; }

        public DateTime? EndDate { get; set; }

        public bool Dismissible { get; set; } = true;

        [MaxLength(100)]
        public string? CreatedBy { get; set; } // Admin username or "System"
    }
}

