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
[HttpGet("{id:guid}")]
[RequirePermission("discount.read")]
public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
{
    var discount = await _db.Discounts
        .AsNoTracking()
        .Include(d => d.Category)
        .Include(d => d.Product!)
            .ThenInclude(p => p.Category)
        .FirstOrDefaultAsync(d => d.Id == id, cancellationToken);

    if (discount is null) return NotFound();

    return Ok(discount.ToDto());
}

[HttpGet("{id:guid}")]
[RequirePermission("discount.read")]
public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
{
    var discount = await _db.Discounts
        .AsNoTracking()
        .Include(d => d.Category)
        .Include(d => d.Product!)
            .ThenInclude(p => p.Category)
        .FirstOrDefaultAsync(d => d.Id == id, cancellationToken);

    if (discount is null) return NotFound();

    return Ok(discount.ToDto());
}

[HttpPost]
[RequirePermission("discount.write")]
public async Task<IActionResult> Create([FromBody] DiscountRequest request, CancellationToken cancellationToken)
{
    var discount = new Discount
    {
        Name = request.Name,
        Type = request.Type,
        Value = request.Value,
        ApplicableTo = request.ApplicableTo,
        Category = request.Category,
        ProductId = request.ProductId,
        StartDate = request.StartDate,
        EndDate = request.EndDate,
        MinPurchase = request.MinPurchase,
        MaxDiscount = request.MaxDiscount,
        Status = request.Status
    };

    _db.Discounts.Add(discount);
    await _db.SaveChangesAsync(cancellationToken);
    
    await _db.Entry(discount).Reference(d => d.Product).LoadAsync(cancellationToken);
    
    return CreatedAtAction(nameof(GetById), new { id = discount.Id }, discount.ToDto());
}

