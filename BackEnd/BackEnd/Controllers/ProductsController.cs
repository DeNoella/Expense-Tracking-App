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
    public class ProductsController : ControllerBase
    {
        private readonly BuyPointDbContext _db;

        public ProductsController(BuyPointDbContext db)
        {
            _db = db;
        }
    }
}
[HttpGet]
[RequirePermission("product.read")]
public async Task<IActionResult> GetAll([FromQuery] ProductCategory? category, [FromQuery] int? categoryId, [FromQuery] string? search, CancellationToken cancellationToken)
{
    try
    {
        var query = _db.Products.AsNoTracking().AsQueryable();

        if (category.HasValue)
            query = query.Where(p => p.Category == category.Value);
        else if (categoryId.HasValue && Enum.IsDefined(typeof(ProductCategory), categoryId.Value))
            query = query.Where(p => p.Category == (ProductCategory)categoryId.Value);

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(p => p.Name.Contains(search) || p.Sku.Contains(search));

        var products = await query.ToListAsync(cancellationToken);
        
        var productIds = products.Select(p => p.Id).ToList();
        var images = await _db.Images
            .Where(img => productIds.Contains(img.ProductId ?? Guid.Empty) && img.IsPrimary)
            .ToListAsync(cancellationToken);

        var imageDict = images.ToDictionary(img => img.ProductId!.Value, img => img);
        foreach (var product in products)
        {
            if (imageDict.TryGetValue(product.Id, out var primaryImage))
                product.ImageUrl = primaryImage.Url ?? product.ImageUrl;
        }
        
        var productDtos = products.Select(p => p.ToDto()).ToList();
        return Ok(productDtos);
    }
    catch (Exception ex)
    {
        return StatusCode(500, new { message = "An error occurred while fetching products", error = ex.Message });
    }
}
