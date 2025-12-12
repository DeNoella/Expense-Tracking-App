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
