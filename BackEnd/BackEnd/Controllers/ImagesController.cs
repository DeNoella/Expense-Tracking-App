using BackEnd.Authorization;
using BackEnd.Data;
using BackEnd.Entities;
using BackEnd.Models.Media;
using BackEnd.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.IO;

namespace BackEnd.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ImagesController : ControllerBase
    {
        private readonly BuyPointDbContext _db;
        private readonly IImageService _imageService;
        private readonly ILogger<ImagesController> _logger;

        public ImagesController(
            BuyPointDbContext db,
            IImageService imageService,
            ILogger<ImagesController> logger)
        {
            _db = db;
            _imageService = imageService;
            _logger = logger;
        }
    }
}
[HttpPost("upload")]
[RequirePermission("product.write")]
public async Task<IActionResult> UploadImage(
    [FromForm] IFormFile file,
    [FromForm] Guid? productId = null,
    [FromForm] string? altText = null,
    [FromForm] string? title = null,
    [FromForm] bool isPrimary = false,
    CancellationToken cancellationToken = default)
{
    if (file == null || file.Length == 0)
    {
        return BadRequest("No file uploaded");
    }

    var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
    var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
    if (!allowedExtensions.Contains(fileExtension))
    {
        return BadRequest("Invalid file type. Allowed types: JPG, JPEG, PNG, GIF, WEBP");
    }

    const long maxFileSize = 10 * 1024 * 1024;
    if (file.Length > maxFileSize)
    {
        return BadRequest("File size exceeds 10MB limit");
    }
