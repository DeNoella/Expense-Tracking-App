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
[HttpGet("{id:guid}")]
[RequirePermission("product.read")]
public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
{
    try
    {
        var product = await _db.Products.AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
        if (product is null) return NotFound();
        
        var primaryImage = await _db.Images
            .FirstOrDefaultAsync(img => img.ProductId == id && img.IsPrimary, cancellationToken);
        if (primaryImage != null)
            product.ImageUrl = primaryImage.Url ?? product.ImageUrl;
        
        return Ok(product.ToDto());
    }
    catch (Exception ex)
    {
        return StatusCode(500, new { message = "An error occurred while fetching the product", error = ex.Message });
    }
}
[HttpPost]
[RequirePermission("product.write")]
public async Task<IActionResult> Create([FromBody] ProductRequest request, CancellationToken cancellationToken)
{
    ProductCategory category;
    if (request.Category.HasValue)
        category = request.Category.Value;
    else if (request.CategoryId.HasValue && Enum.IsDefined(typeof(ProductCategory), request.CategoryId.Value))
        category = (ProductCategory)request.CategoryId.Value;
    else
        return BadRequest("Category is required. Provide either Category (enum) or CategoryId (int).");

    var product = new Product
    {
        Category = category,
        Name = request.Name,
        Sku = request.Sku,
        Price = request.Price,
        OriginalPrice = request.OriginalPrice,
        StockQty = request.StockQty,
        ImageUrl = request.ImageUrl,
        Description = request.Description,
        Brand = request.Brand,
        Rating = request.Rating,
        ReviewCount = request.ReviewCount,
        Tags = request.Tags,
        IsActive = request.IsActive
    };

    _db.Products.Add(product);
    await _db.SaveChangesAsync(cancellationToken);
    
    return CreatedAtAction(nameof(GetById), new { id = product.Id }, product.ToDto());
}
