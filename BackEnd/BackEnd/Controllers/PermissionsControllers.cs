using BackEnd.Authorization;
using BackEnd.Data;
using BackEnd.Models.Permissions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BackEnd.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PermissionsController : ControllerBase
    {
        private readonly BuyPointDbContext _db;

        public PermissionsController(BuyPointDbContext db)
        {
            _db = db;
        }
    }
}
[HttpGet]
[RequirePermission("permission.manage")]
public IActionResult GetAll(CancellationToken cancellationToken)
{
    // Return all available permissions with descriptions and groups
    var perms = PermissionConstants.All.Select(p => new 
    { 
        Key = p, 
        Description = PermissionConstants.Descriptions.GetValueOrDefault(p, p),
        Group = PermissionConstants.PermissionGroups
            .FirstOrDefault(g => g.Value.Contains(p))
            .Key ?? "Other"
    }).ToList();

    // Also return grouped format for easier UI rendering
    var grouped = PermissionConstants.PermissionGroups.Select(g => new
    {
        Group = g.Key,
        Permissions = g.Value.Select(p => new
        {
            Key = p,
            Description = PermissionConstants.Descriptions.GetValueOrDefault(p, p)
        }).ToList()
    }).ToList();

    return Ok(new 
    { 
        All = perms,
        Grouped = grouped
    });
}
