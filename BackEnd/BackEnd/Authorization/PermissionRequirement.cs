using Microsoft.AspNetCore.Authorization;

namespace BackEnd.Authorization
{
    public class PermissionRequirement(string permission) : IAuthorizationRequirement
    {
        public string Permission { get; } = permission;
    }
}

