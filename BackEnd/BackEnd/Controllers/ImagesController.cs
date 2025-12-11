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

            // Validate file type
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
            var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!allowedExtensions.Contains(fileExtension))
            {
                return BadRequest("Invalid file type. Allowed types: JPG, JPEG, PNG, GIF, WEBP");
            }

            // Validate file size (max 10MB)
            const long maxFileSize = 10 * 1024 * 1024; // 10MB
            if (file.Length > maxFileSize)
            {
                return BadRequest("File size exceeds 10MB limit");
            }

            try
            {
                // Save file to disk
                var filePath = await _imageService.SaveImageAsync(
                    file.OpenReadStream(),
                    file.FileName,
                    file.ContentType,
                    cancellationToken);

                // Get full URL
                var imageUrl = _imageService.GetImageUrl(filePath);

                // If this is a primary image, unset other primary images for the same product
                if (isPrimary && productId.HasValue)
                {
                    var existingPrimary = await _db.Images
                        .Where(i => i.ProductId == productId && i.IsPrimary)
                        .ToListAsync(cancellationToken);
                    foreach (var img in existingPrimary)
                    {
                        img.IsPrimary = false;
                    }
                }

                // Create image record in database
                var image = new Image
                {
                    FileName = file.FileName,
                    FilePath = filePath,
                    Url = imageUrl,
                    ContentType = file.ContentType,
                    FileSize = file.Length,
                    AltText = altText,
                    Title = title,
                    ProductId = productId,
                    IsPrimary = isPrimary
                };

                _db.Images.Add(image);
                await _db.SaveChangesAsync(cancellationToken);

                return Ok(new ImageDto
                {
                    Id = image.Id,
                    FileName = image.FileName,
                    FilePath = image.FilePath,
                    Url = image.Url,
                    ContentType = image.ContentType,
                    FileSize = image.FileSize,
                    AltText = image.AltText,
                    Title = image.Title,
                    ProductId = image.ProductId,
                    IsPrimary = image.IsPrimary,
                    CreatedAt = image.CreatedAt
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading image");
                return StatusCode(500, "Error uploading image");
            }
        }

        [HttpGet]
        [RequirePermission("product.read")]
        public async Task<IActionResult> GetAll(
            [FromQuery] Guid? productId = null,
            CancellationToken cancellationToken = default)
        {
            var query = _db.Images.AsQueryable();

            if (productId.HasValue)
            {
                query = query.Where(i => i.ProductId == productId);
            }

            var images = await query
                .OrderByDescending(i => i.IsPrimary)
                .ThenByDescending(i => i.CreatedAt)
                .Select(i => new ImageDto
                {
                    Id = i.Id,
                    FileName = i.FileName,
                    FilePath = i.FilePath,
                    Url = i.Url,
                    ContentType = i.ContentType,
                    FileSize = i.FileSize,
                    AltText = i.AltText,
                    Title = i.Title,
                    ProductId = i.ProductId,
                    IsPrimary = i.IsPrimary,
                    CreatedAt = i.CreatedAt
                })
                .ToListAsync(cancellationToken);

            return Ok(images);
        }

        [HttpGet("{id:guid}")]
        [RequirePermission("product.read")]
        public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
        {
            var image = await _db.Images
                .Where(i => i.Id == id)
                .Select(i => new ImageDto
                {
                    Id = i.Id,
                    FileName = i.FileName,
                    FilePath = i.FilePath,
                    Url = i.Url,
                    ContentType = i.ContentType,
                    FileSize = i.FileSize,
                    AltText = i.AltText,
                    Title = i.Title,
                    ProductId = i.ProductId,
                    IsPrimary = i.IsPrimary,
                    CreatedAt = i.CreatedAt
                })
                .FirstOrDefaultAsync(cancellationToken);

            if (image == null)
            {
                return NotFound();
            }

            return Ok(image);
        }

        [HttpDelete("{id:guid}")]
        [RequirePermission("product.write")]
        public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
        {
            var image = await _db.Images.FindAsync(new object[] { id }, cancellationToken);
            if (image == null)
            {
                return NotFound();
            }

            // Delete file from disk
            await _imageService.DeleteImageAsync(image.FilePath, cancellationToken);

            // Delete record from database
            _db.Images.Remove(image);
            await _db.SaveChangesAsync(cancellationToken);

            return NoContent();
        }

        [HttpPut("{id:guid}/set-primary")]
        [RequirePermission("product.write")]
        public async Task<IActionResult> SetPrimary(Guid id, CancellationToken cancellationToken)
        {
            var image = await _db.Images.FindAsync(new object[] { id }, cancellationToken);
            if (image == null)
            {
                return NotFound();
            }

            // Unset other primary images for the same product
            if (image.ProductId.HasValue)
            {
                var existingPrimary = await _db.Images
                    .Where(i => i.ProductId == image.ProductId && i.IsPrimary && i.Id != id)
                    .ToListAsync(cancellationToken);
                foreach (var img in existingPrimary)
                {
                    img.IsPrimary = false;
                }
            }

            // Set this image as primary
            image.IsPrimary = true;
            await _db.SaveChangesAsync(cancellationToken);

            return Ok(new { Message = "Image set as primary" });
        }
    }
}

