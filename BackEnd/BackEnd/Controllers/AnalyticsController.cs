using BackEnd.Authorization;
using BackEnd.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BackEnd.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AnalyticsController : ControllerBase
    {
        private readonly BuyPointDbContext _db;
        private readonly ILogger<AnalyticsController> _logger;

        public AnalyticsController(BuyPointDbContext db, ILogger<AnalyticsController> logger)
        {
            _db = db;
            _logger = logger;
        }

        [HttpGet("product-stats")]
        [RequirePermission("dashboard.view")]
        public async Task<IActionResult> GetProductStats(CancellationToken cancellationToken)
        {
            var totalProducts = await _db.Products.CountAsync(cancellationToken);
            var totalRevenue = await _db.Payments
                .Where(p => p.Status == Entities.PaymentStatus.Completed)
                .SumAsync(p => (decimal?)p.Amount, cancellationToken) ?? 0;

            var productsWithReviews = await _db.Products
                .Where(p => p.ReviewCount > 0)
                .ToListAsync(cancellationToken);

            var avgRating = productsWithReviews.Any() 
                ? productsWithReviews.Average(p => (double?)p.Rating) ?? 0 
                : 0;

            var totalReviews = productsWithReviews.Sum(p => p.ReviewCount);

            return Ok(new
            {
                TotalProducts = totalProducts,
                TotalRevenue = totalRevenue,
                AvgRating = Math.Round(avgRating, 1),
                TotalReviews = totalReviews
            });
        }

        [HttpGet("sales-by-category")]
        [RequirePermission("dashboard.view")]
        public async Task<IActionResult> GetSalesByCategory(CancellationToken cancellationToken)
        {
            var salesByCategory = await _db.OrderItems
                .Include(oi => oi.Product)
                    .ThenInclude(p => p.Category)
                .Include(oi => oi.Order)
                    .ThenInclude(o => o.Payments)
                .Where(oi => oi.Order.Payments.Any(p => p.Status == Entities.PaymentStatus.Completed))
                .GroupBy(oi => oi.Product.Category.ToString())
                .Select(g => new
                {
                    Name = g.Key,
                    Value = g.Sum(oi => oi.LineTotal)
                })
                .OrderByDescending(x => x.Value)
                .ToListAsync(cancellationToken);

            // Add colors for frontend
            var colors = new[] { "hsl(var(--primary))", "hsl(var(--info))", "hsl(var(--success))", "hsl(var(--warning))", "hsl(var(--destructive))" };
            var result = salesByCategory.Select((item, index) => new
            {
                item.Name,
                item.Value,
                Color = colors[index % colors.Length]
            }).ToList();

            return Ok(result);
        }

        [HttpGet("top-selling-products")]
        [RequirePermission("dashboard.view")]
        public async Task<IActionResult> GetTopSellingProducts([FromQuery] int limit = 5, CancellationToken cancellationToken = default)
        {
            var topProducts = await _db.OrderItems
                .Include(oi => oi.Product)
                .Include(oi => oi.Order)
                    .ThenInclude(o => o.Payments)
                .Where(oi => oi.Order.Payments.Any(p => p.Status == Entities.PaymentStatus.Completed))
                .GroupBy(oi => new { oi.ProductId, oi.Product.Name })
                .Select(g => new
                {
                    Name = g.Key.Name,
                    Units = g.Sum(oi => oi.Quantity),
                    Revenue = g.Sum(oi => oi.LineTotal)
                })
                .OrderByDescending(x => x.Units)
                .Take(limit)
                .ToListAsync(cancellationToken);

            return Ok(topProducts);
        }

        [HttpGet("sales-trend")]
        [RequirePermission("dashboard.view")]
        public async Task<IActionResult> GetSalesTrend([FromQuery] int months = 6, CancellationToken cancellationToken = default)
        {
            var startDate = DateTime.UtcNow.AddMonths(-months);
            
            var salesTrend = await _db.Payments
                .Where(p => p.Status == Entities.PaymentStatus.Completed && p.CreatedAt >= startDate)
                .GroupBy(p => new { p.CreatedAt.Year, p.CreatedAt.Month })
                .Select(g => new
                {
                    Month = new DateTime(g.Key.Year, g.Key.Month, 1).ToString("MMM"),
                    Sales = g.Sum(p => p.Amount)
                })
                .OrderBy(x => x.Month)
                .ToListAsync(cancellationToken);

            return Ok(salesTrend);
        }

        [HttpGet("low-stock-products")]
        [RequirePermission("dashboard.view")]
        public async Task<IActionResult> GetLowStockProducts([FromQuery] int threshold = 50, CancellationToken cancellationToken = default)
        {
            var lowStockProducts = await _db.Products
                .Where(p => p.StockQty < threshold)
                .OrderBy(p => p.StockQty)
                .Take(10)
                .Select(p => new
                {
                    p.Id,
                    p.Name,
                    p.ImageUrl,
                    p.StockQty,
                    p.Price
                })
                .ToListAsync(cancellationToken);

            return Ok(lowStockProducts);
        }

        [HttpGet("top-reviewed-products")]
        [RequirePermission("dashboard.view")]
        public async Task<IActionResult> GetTopReviewedProducts([FromQuery] int limit = 10, CancellationToken cancellationToken = default)
        {
            var topReviewed = await _db.Products
                .Where(p => p.ReviewCount > 0)
                .OrderByDescending(p => p.ReviewCount)
                .Take(limit)
                .Select(p => new
                {
                    p.Id,
                    p.Name,
                    p.ImageUrl,
                    p.Rating,
                    p.ReviewCount,
                    p.Price
                })
                .ToListAsync(cancellationToken);

            return Ok(topReviewed);
        }
    }
}

