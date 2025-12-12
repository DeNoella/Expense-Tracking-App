using BackEnd.Authorization;
using BackEnd.Data;
using BackEnd.Entities;
using BackEnd.Models.Catalog;
using BackEnd.Models.Mappers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BackEnd.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoriesController : ControllerBase
    {
        private readonly BuyPointDbContext _db;

        public CategoriesController(BuyPointDbContext db)
        {
            _db = db;
        }
    }
}
[HttpGet]
[RequirePermission("discount.read")]
public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
{
    var discounts = await _db.Discounts
        .AsNoTracking()
        .Include(d => d.Category)
        .Include(d => d.Product!)
            .ThenInclude(p => p.Category)
        .OrderByDescending(d => d.CreatedAt)
        .ToListAsync(cancellationToken);
    
    var discountDtos = discounts.Select(d => d.ToDto()).ToList();
    return Ok(discountDtos);
}
