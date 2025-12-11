using System.IO;

namespace BackEnd.Services
{
    public class ImageService : IImageService
    {
        private readonly IWebHostEnvironment _environment;
        private readonly IConfiguration _configuration;
        private readonly ILogger<ImageService> _logger;

        public ImageService(
            IWebHostEnvironment environment,
            IConfiguration configuration,
            ILogger<ImageService> logger)
        {
            _environment = environment;
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<string> SaveImageAsync(Stream fileStream, string fileName, string contentType, CancellationToken cancellationToken = default)
        {
            // Create uploads directory if it doesn't exist
            var uploadsPath = Path.Combine(_environment.WebRootPath ?? _environment.ContentRootPath, "uploads", "images");
            if (!Directory.Exists(uploadsPath))
            {
                Directory.CreateDirectory(uploadsPath);
            }

            // Generate unique filename to avoid conflicts
            var fileExtension = Path.GetExtension(fileName);
            var uniqueFileName = $"{Guid.NewGuid()}{fileExtension}";
            var filePath = Path.Combine(uploadsPath, uniqueFileName);

            // Save file
            using (var fileStreamOutput = new FileStream(filePath, FileMode.Create))
            {
                await fileStream.CopyToAsync(fileStreamOutput, cancellationToken);
            }

            // Return relative path
            return Path.Combine("uploads", "images", uniqueFileName).Replace("\\", "/");
        }

        public Task<bool> DeleteImageAsync(string filePath, CancellationToken cancellationToken = default)
        {
            try
            {
                var fullPath = Path.Combine(_environment.WebRootPath ?? _environment.ContentRootPath, filePath);
                if (File.Exists(fullPath))
                {
                    File.Delete(fullPath);
                    return Task.FromResult(true);
                }
                return Task.FromResult(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting image: {FilePath}", filePath);
                return Task.FromResult(false);
            }
        }

        public string GetImageUrl(string filePath)
        {
            if (string.IsNullOrEmpty(filePath))
                return string.Empty;

            // Get base URL from configuration or use default
            var baseUrl = _configuration["BaseUrl"] ?? "http://localhost:5144";
            
            // Ensure filePath starts with /
            if (!filePath.StartsWith("/"))
                filePath = "/" + filePath;

            return $"{baseUrl}{filePath}";
        }
    }
}

