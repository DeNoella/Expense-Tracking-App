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
    }
}
[HttpPost("checkout")]
[RequirePermission("cart.manage")]
public async Task<IActionResult> Checkout([FromBody] CheckoutRequest request, CancellationToken cancellationToken)
{
    var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    var cart = await _db.Carts.Include(c => c.Items).FirstOrDefaultAsync(c => c.UserId == userId, cancellationToken);
    if (cart is null || !cart.Items.Any()) return BadRequest("Cart is empty");

    await using var tx = await _db.Database.BeginTransactionAsync(cancellationToken);

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
