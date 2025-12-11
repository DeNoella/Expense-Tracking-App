using Microsoft.AspNetCore.Authorization;

namespace BackEnd.Authorization
{
    [AttributeUsage(AttributeTargets.Method | AttributeTargets.Class, AllowMultiple = true)]
    public class RequirePermissionAttribute : AuthorizeAttribute
    {
        public RequirePermissionAttribute(string permission)
        {
            Permission = permission;
            Policy = $"{PermissionConstants.PolicyPrefix}{Permission}";
        }

        public string Permission { get; }
    }
}

