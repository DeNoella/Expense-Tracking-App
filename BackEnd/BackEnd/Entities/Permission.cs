using System.ComponentModel.DataAnnotations;

namespace BackEnd.Entities
{
    public class Permission
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required, MaxLength(100)]
        public string Key { get; set; } = string.Empty;

        [MaxLength(256)]
        public string? Description { get; set; }

        public ICollection<UserPermission> UserPermissions { get; set; } = new List<UserPermission>();
    }
}

