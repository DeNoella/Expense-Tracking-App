using BackEnd.Authorization;
using BackEnd.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BackEnd.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DashboardController : ControllerBase
    {
        private readonly BuyPointDbContext _db;

        public DashboardController(BuyPointDbContext db)
        {
            _db = db;
        }

        [HttpGet("summary")]
        [RequirePermission("dashboard.view")]
        public async Task<IActionResult> Summary(CancellationToken cancellationToken)
        {
            var totalSales = await _db.Payments.Where(p => p.Status == Entities.PaymentStatus.Completed)
                .SumAsync(p => (decimal?)p.Amount, cancellationToken) ?? 0;

            var lowStock = await _db.Products.CountAsync(p => p.StockQty < 5, cancellationToken);
            var pendingIssues = await _db.Issues.CountAsync(i => i.Status == Entities.IssueStatus.Open || i.Status == Entities.IssueStatus.Responded, cancellationToken);

            return Ok(new
            {
                TotalSales = totalSales,
                LowStockCount = lowStock,
                PendingIssues = pendingIssues
            });
        }
    }
}

