namespace BackEnd.Entities
{
    public class UserPermission
    {
        public Guid UserId { get; set; }
        public Users User { get; set; } = null!;

        public Guid PermissionId { get; set; }
        public Permission Permission { get; set; } = null!;
    }
}

