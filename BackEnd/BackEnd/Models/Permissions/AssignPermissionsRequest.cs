namespace BackEnd.Models.Permissions
{
    public class AssignPermissionsRequest
    {
        public IEnumerable<string> Permissions { get; set; } = [];
    }
}

