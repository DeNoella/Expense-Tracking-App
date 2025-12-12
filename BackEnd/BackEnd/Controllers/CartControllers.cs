using System.Security.Claims;
using BackEnd.Authorization;
using BackEnd.Data;
using BackEnd.Entities;
using BackEnd.Models.Cart;
using BackEnd.Models.Mappers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BackEnd.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CartController : ControllerBase
    {
        private readonly BuyPointDbContext _db;

        public CartController(BuyPointDbContext db)
        {
            _db = db;
        }
        [HttpGet]
        [RequirePermission("cart.manage")]
        public async Task<IActionResult> Get(CancellationToken cancellationToken)
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var cart = await GetOrCreateCartAsync(userId, cancellationToken);

            var items = await _db.CartItems
                .Where(ci => ci.CartId == cart.Id)
                .Include(ci => ci.Product)
                .ToListAsync(cancellationToken);

            var cartDto = cart.ToDto();
            cartDto.Items = items.Select(i => i.ToDto()).ToList();
            return Ok(cartDto);
        }
        [HttpPost("items")]
        [RequirePermission("cart.manage")]
        public async Task<IActionResult> AddItem([FromBody] CartItemRequest request, CancellationToken cancellationToken)
        {
            if (request.Quantity <= 0) return BadRequest("Quantity must be greater than zero");

            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var cart = await GetOrCreateCartAsync(userId, cancellationToken);

            var product = await _db.Products.FindAsync([request.ProductId], cancellationToken);
            if (product is null || !product.IsActive) return BadRequest("Invalid product");

            var item = await _db.CartItems.FirstOrDefaultAsync(ci => ci.CartId == cart.Id && ci.ProductId == request.ProductId, cancellationToken);
            if (item is null)
            {
                item = new CartItem
                {
                    CartId = cart.Id,
                    ProductId = request.ProductId,
                    Quantity = request.Quantity
                };
                _db.CartItems.Add(item);
            }
            else
            {
                item.Quantity += request.Quantity;
            }

            await _db.SaveChangesAsync(cancellationToken);

            await _db.Entry(item).Reference(i => i.Product).LoadAsync(cancellationToken);

            return Ok(item.ToDto());
        }
        [HttpPut("items")]
        [RequirePermission("cart.manage")]
        public async Task<IActionResult> UpdateItem([FromBody] CartItemRequest request, CancellationToken cancellationToken)
        {
            if (request.Quantity <= 0) return BadRequest("Quantity must be greater than zero");

            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var cart = await GetOrCreateCartAsync(userId, cancellationToken);

            var item = await _db.CartItems.FirstOrDefaultAsync(ci => ci.CartId == cart.Id && ci.ProductId == request.ProductId, cancellationToken);
            if (item is null) return NotFound();

            item.Quantity = request.Quantity;
            await _db.SaveChangesAsync(cancellationToken);

            await _db.Entry(item).Reference(i => i.Product).LoadAsync(cancellationToken);

            return Ok(item.ToDto());
        }
        [HttpDelete("items/{productId:guid}")]
        [RequirePermission("cart.manage")]
        public async Task<IActionResult> RemoveItem(Guid productId, CancellationToken cancellationToken)
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var cart = await GetOrCreateCartAsync(userId, cancellationToken);

            var item = await _db.CartItems.FirstOrDefaultAsync(ci => ci.CartId == cart.Id && ci.ProductId == productId, cancellationToken);
            if (item is null) return NotFound();

            _db.CartItems.Remove(item);
            await _db.SaveChangesAsync(cancellationToken);
            return NoContent();
        }
