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
[RequirePermission("category.read")]
public IActionResult GetAll(CancellationToken cancellationToken)
{
    // Return enum values as categories
    var categories = Enum.GetValues(typeof(ProductCategory))
        .Cast<ProductCategory>()
        .Select(c => new
        {
            Id = (int)c,
            Name = c.ToString(),
            Value = c
        })
        .ToList();
    return Ok(categories);
}
[HttpPost]
[RequirePermission("category.write")]
public IActionResult Create([FromBody] CategoryRequest request, CancellationToken cancellationToken)
{
    return BadRequest("Categories are now enum values. Cannot create new categories.");
}
