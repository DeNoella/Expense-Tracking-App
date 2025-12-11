using System.Security.Claims;
using BackEnd.Authorization;
using BackEnd.Data;
using BackEnd.Entities;
using BackEnd.Models.Mappers;
using BackEnd.Models.Orders;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BackEnd.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrdersController : ControllerBase
    {
        private readonly BuyPointDbContext _db;
        private readonly ILogger<OrdersController> _logger;

        public OrdersController(BuyPointDbContext db, ILogger<OrdersController> logger)
        {
            _db = db;
            _logger = logger;
        }

        [HttpPost("checkout")]
        [RequirePermission("cart.manage")]
        public async Task<IActionResult> Checkout([FromBody] CheckoutRequest request, CancellationToken cancellationToken)
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var cart = await _db.Carts.Include(c => c.Items).FirstOrDefaultAsync(c => c.UserId == userId, cancellationToken);
            if (cart is null || !cart.Items.Any()) return BadRequest("Cart is empty");

            await using var tx = await _db.Database.BeginTransactionAsync(cancellationToken);

            // Generate order number
            var orderNumber = $"ORD-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString().Substring(0, 6).ToUpper()}";

            var order = new Order
            {
                UserId = userId,
                OrderNumber = orderNumber,
                Status = OrderStatus.Pending,
                Total = 0,
                ShippingAddressName = request.ShippingAddressName,
                ShippingAddress = request.ShippingAddress,
                ShippingCity = request.ShippingCity,
                ShippingCountry = request.ShippingCountry,
                ShippingPostalCode = request.ShippingPostalCode,
                ShippingPhone = request.ShippingPhone,
                ShippingInstructions = request.ShippingInstructions
            };
            _db.Orders.Add(order);

            decimal total = 0;

            foreach (var item in cart.Items)
            {
                var product = await _db.Products.FirstOrDefaultAsync(p => p.Id == item.ProductId, cancellationToken);
                if (product is null || !product.IsActive) return BadRequest("Invalid product in cart");
                if (product.StockQty < item.Quantity) return BadRequest($"Insufficient stock for {product.Name}");

                product.StockQty -= item.Quantity;
                var lineTotal = product.Price * item.Quantity;
                total += lineTotal;

                _db.OrderItems.Add(new OrderItem
                {
                    Order = order,
                    ProductId = product.Id,
                    UnitPrice = product.Price,
                    Quantity = item.Quantity,
                    LineTotal = lineTotal
                });
            }

            order.Total = total;

            _db.CartItems.RemoveRange(cart.Items);
            await _db.SaveChangesAsync(cancellationToken);
            await tx.CommitAsync(cancellationToken);

            return Ok(new { order.Id, order.OrderNumber, order.Total, order.Status });
        }

        [HttpGet("me")]
        [RequirePermission("order.view.own")]
        public async Task<IActionResult> MyOrders(CancellationToken cancellationToken)
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var orders = await _db.Orders
                .AsNoTracking()
                .Where(o => o.UserId == userId)
                .Include(o => o.Items)
                    .ThenInclude(i => i.Product)
                        .ThenInclude(p => p.Category)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync(cancellationToken);

            var orderDtos = orders.Select(o => o.ToDto()).ToList();
            return Ok(orderDtos);
        }

        [HttpGet("{id:guid}")]
        [Authorize]
        public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
        {
            var order = await _db.Orders
                .AsNoTracking()
                .Include(o => o.Items)
                    .ThenInclude(i => i.Product)
                        .ThenInclude(p => p.Category)
                .Include(o => o.Payments)
                .Include(o => o.User)
                .FirstOrDefaultAsync(o => o.Id == id, cancellationToken);

            if (order is null) return NotFound();

            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var hasAllAccess = User.HasClaim(c => c.Type == PermissionConstants.ClaimType && c.Value == "order.view.any");

            if (order.UserId != userId && !hasAllAccess)
            {
                return Forbid();
            }

            return Ok(order.ToDto());
        }

        [HttpGet]
        [RequirePermission("order.view.any")]
        public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
        {
            var orders = await _db.Orders
                .AsNoTracking()
                .Include(o => o.User)
                .Include(o => o.Items)
                    .ThenInclude(i => i.Product)
                        .ThenInclude(p => p.Category)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync(cancellationToken);
            
            var orderDtos = orders.Select(o => o.ToDto()).ToList();
            return Ok(orderDtos);
        }

        [HttpPatch("{id:guid}/status")]
        [RequirePermission("order.status.update")]
        public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] OrderStatusUpdateRequest request, CancellationToken cancellationToken)
        {
            var order = await _db.Orders.FindAsync(new object?[] { id }, cancellationToken);
            if (order is null) return NotFound();

            order.Status = request.Status;
            order.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync(cancellationToken);
            
            // Reload with related data for DTO mapping
            await _db.Entry(order).Collection(o => o.Items).Query()
                .Include(i => i.Product)
                    .ThenInclude(p => p.Category)
                .LoadAsync(cancellationToken);
            await _db.Entry(order).Reference(o => o.User).LoadAsync(cancellationToken);
            await _db.Entry(order).Collection(o => o.Payments).LoadAsync(cancellationToken);
            
            return Ok(order.ToDto());
        }
    }
}

