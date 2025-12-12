using BackEnd.Authorization;
using BackEnd.Data;
using BackEnd.Models.Auth;
using BackEnd.Models.Mappers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Hosting;

namespace BackEnd.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly BuyPointDbContext _db;
        private readonly ILogger<UsersController> _logger;
        private readonly IWebHostEnvironment _environment;

        public UsersController(BuyPointDbContext db, ILogger<UsersController> logger, IWebHostEnvironment environment)
        {
            _db = db;
            _logger = logger;
            _environment = environment;
        }
    }
}

[HttpGet]
[RequirePermission("user.view.any")]
public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
{
    var users = await _db.Users
        .AsNoTracking()
        .Include(u => u.Orders)
        .OrderByDescending(u => u.CreatedAt)
        .ToListAsync(cancellationToken);

    var userDtos = users.Select(u => {
        var perms = string.IsNullOrEmpty(u.Permissions) 
            ? new List<string>() 
            : u.Permissions.Split(',', StringSplitOptions.RemoveEmptyEntries).Select(p => p.Trim()).ToList();
        return new
        {
            u.Id,
            u.Email,
            u.FullName,
            u.IsEmailVerified,
            u.IsTwoFactorEnabled,
            u.TwoFactorMethod,
            u.CreatedAt,
            OrdersCount = u.Orders.Count,
            TotalSpent = u.Orders.Where(o => o.Status == Entities.OrderStatus.Delivered).Sum(o => o.Total),
            Permissions = perms,
            HasAdminPermissions = perms.Any(p => p.Contains("admin") || p == "order.view.any")
        };
    }).ToList();

    return Ok(userDtos);
}
[HttpGet("{id:guid}")]
[RequirePermission("user.view.any")]
public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
{
    var user = await _db.Users
        .AsNoTracking()
        .Include(u => u.Orders)
        .FirstOrDefaultAsync(u => u.Id == id, cancellationToken);

    if (user is null) return NotFound();

    var permissions = string.IsNullOrEmpty(user.Permissions) 
        ? new List<string>() 
        : user.Permissions.Split(',', StringSplitOptions.RemoveEmptyEntries).Select(p => p.Trim()).ToList();
    
    var userDto = new
    {
        user.Id,
        user.Email,
        user.FullName,
        user.IsEmailVerified,
        user.IsTwoFactorEnabled,
        user.TwoFactorMethod,
        user.CreatedAt,
        OrdersCount = user.Orders.Count,
        TotalSpent = user.Orders.Where(o => o.Status == Entities.OrderStatus.Delivered).Sum(o => o.Total),
        Permissions = permissions,
        HasAdminPermissions = permissions.Contains("order.view.any") || 
                             permissions.Any(p => p.Contains("admin") || p == "user.manage" || p == "user.view.any")
    };

    return Ok(userDto);
}
