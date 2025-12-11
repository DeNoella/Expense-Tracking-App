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
            
            // Reload with related data for DTO mapping
            await _db.Entry(issue).Reference(i => i.Order).LoadAsync(cancellationToken);
            await _db.Entry(issue).Reference(i => i.Product).LoadAsync(cancellationToken);
            // Category is now an enum, no need to load
            await _db.Entry(issue).Reference(i => i.User).LoadAsync(cancellationToken);
            
            return Ok(issue.ToDto());
        }

        [HttpGet("me")]
        [RequirePermission("order.view.own")]
        public async Task<IActionResult> MyIssues(CancellationToken cancellationToken)
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var issues = await _db.Issues
                .AsNoTracking()
                .Where(i => i.UserId == userId)
                .Include(i => i.Order)
                .Include(i => i.Product!)
                .ToListAsync(cancellationToken);
            
            var issueDtos = issues.Select(i => i.ToDto()).ToList();
            return Ok(issueDtos);
        }

        [HttpGet]
        [RequirePermission("issue.view")]
        public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
        {
            var issues = await _db.Issues
                .AsNoTracking()
                .Include(i => i.User)
                .Include(i => i.Order)
                .Include(i => i.Product!)
                .OrderByDescending(i => i.CreatedAt)
                .ToListAsync(cancellationToken);
            
            var issueDtos = issues.Select(i => i.ToDto()).ToList();
            return Ok(issueDtos);
        }

        [HttpPatch("{id:guid}")]
        [RequirePermission("issue.resolve")]
        public async Task<IActionResult> Update(Guid id, [FromBody] IssueUpdateRequest request, CancellationToken cancellationToken)
        {
            var issue = await _db.Issues.FindAsync(new object?[] { id }, cancellationToken);
            if (issue is null) return NotFound();

            issue.Status = request.Status;
            issue.AdminResponse = request.AdminResponse;
            issue.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync(cancellationToken);
            
            // Reload with related data for DTO mapping
            await _db.Entry(issue).Reference(i => i.Order).LoadAsync(cancellationToken);
            await _db.Entry(issue).Reference(i => i.Product).LoadAsync(cancellationToken);
            // Category is now an enum, no need to load
            await _db.Entry(issue).Reference(i => i.User).LoadAsync(cancellationToken);
            
            return Ok(issue.ToDto());
        }
    }
}

