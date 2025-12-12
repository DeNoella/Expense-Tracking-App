using System.Security.Claims;
using BackEnd.Authorization;
using BackEnd.Data;
using BackEnd.Entities;
using BackEnd.Models.Issues;
using BackEnd.Models.Mappers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BackEnd.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class IssuesController : ControllerBase
    {
        private readonly BuyPointDbContext _db;

        public IssuesController(BuyPointDbContext db)
        {
            _db = db;
        }
    }
}
[HttpPost]
[RequirePermission("order.view.own")]
public async Task<IActionResult> Create([FromBody] IssueRequest request, CancellationToken cancellationToken)
{
    var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    var order = await _db.Orders.FirstOrDefaultAsync(o => o.Id == request.OrderId && o.UserId == userId, cancellationToken);
    if (order is null) return BadRequest("Order not found or not yours");

    var issue = new Issue
    {
        UserId = userId,
        OrderId = request.OrderId,
        OrderItemId = request.OrderItemId,
        ProductId = request.ProductId,
        Title = request.Title,
        Description = request.Description,
        Reason = request.Reason,
        Amount = request.Amount
    };

    _db.Issues.Add(issue);
    await _db.SaveChangesAsync(cancellationToken);

    await _db.Entry(issue).Reference(i => i.Order).LoadAsync(cancellationToken);
    await _db.Entry(issue).Reference(i => i.Product).LoadAsync(cancellationToken);
    await _db.Entry(issue).Reference(i => i.User).LoadAsync(cancellationToken);

    return Ok(issue.ToDto());
}
