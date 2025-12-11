using CloudinaryDotNet;
using CloudinaryDotNet.Actions;

namespace BackEnd.Services
{
    public class CloudinaryImageService : IImageService
    {
        private readonly Cloudinary _cloudinary;
        private readonly IConfiguration _configuration;
        private readonly ILogger<CloudinaryImageService> _logger;

        public CloudinaryImageService(
            IConfiguration configuration,
            ILogger<CloudinaryImageService> logger)
        {
            _configuration = configuration;
            _logger = logger;

            var cloudName = _configuration["Cloudinary:CloudName"];
            var apiKey = _configuration["Cloudinary:ApiKey"];
            var apiSecret = _configuration["Cloudinary:ApiSecret"];

            if (string.IsNullOrEmpty(cloudName) || string.IsNullOrEmpty(apiKey) || string.IsNullOrEmpty(apiSecret))
            {
                throw new InvalidOperationException("Cloudinary configuration is missing. Please set Cloudinary:CloudName, Cloudinary:ApiKey, and Cloudinary:ApiSecret in appsettings.json");
            }

            var account = new Account(cloudName, apiKey, apiSecret);
            _cloudinary = new Cloudinary(account);
        }

        public async Task<string> SaveImageAsync(Stream fileStream, string fileName, string contentType, CancellationToken cancellationToken = default)
        {
            try
            {
                // Generate unique public ID to avoid conflicts
                var publicId = $"buypoint/{Guid.NewGuid()}";

                // Upload parameters
                var uploadParams = new ImageUploadParams()
                {
                    File = new FileDescription(fileName, fileStream),
                    PublicId = publicId,
                    Folder = "buypoint/products", // Organize images in folders
                    Overwrite = false,
                    // Automatic image optimization
                    Transformation = new Transformation()
                        .Quality("auto") // Automatic quality optimization
                        .FetchFormat("auto") // Automatic format (WebP when supported)
                };

                // Upload to Cloudinary
                var uploadResult = await _cloudinary.UploadAsync(uploadParams);

                if (uploadResult.StatusCode == System.Net.HttpStatusCode.OK)
                {
                    _logger.LogInformation("Image uploaded successfully to Cloudinary: {PublicId}, URL: {Url}", 
                        uploadResult.PublicId, uploadResult.SecureUrl);
                    
                    // Return the public ID (we'll use this to generate URLs)
                    return uploadResult.PublicId;
                }
                else
                {
                    _logger.LogError("Failed to upload image to Cloudinary. Status: {Status}, Error: {Error}", 
                        uploadResult.StatusCode, uploadResult.Error?.Message);
                    throw new Exception($"Failed to upload image: {uploadResult.Error?.Message}");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading image to Cloudinary");
                throw;
            }
        }

        public async Task<bool> DeleteImageAsync(string publicId, CancellationToken cancellationToken = default)
        {
            try
            {
                if (string.IsNullOrEmpty(publicId))
                    return false;

                var deleteParams = new DeletionParams(publicId)
                {
                    ResourceType = ResourceType.Image
                };

                var result = await _cloudinary.DestroyAsync(deleteParams);

                if (result.Result == "ok")
                {
                    _logger.LogInformation("Image deleted successfully from Cloudinary: {PublicId}", publicId);
                    return true;
                }
                else
                {
                    _logger.LogWarning("Failed to delete image from Cloudinary: {PublicId}, Result: {Result}", 
                        publicId, result.Result);
                    return false;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting image from Cloudinary: {PublicId}", publicId);
                return false;
            }
        }

        public string GetImageUrl(string publicId)
        {
            if (string.IsNullOrEmpty(publicId))
                return string.Empty;

            try
            {
                // Generate optimized image URL with transformations
                var url = _cloudinary.Api.UrlImgUp
                    .Transform(new Transformation()
                        .Quality("auto")
                        .FetchFormat("auto")
                        .Width(800) // Default width for product images
                        .Height(800)
                        .Crop("limit")) // Maintain aspect ratio, don't crop
                    .BuildUrl(publicId);

                return url;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating Cloudinary URL for: {PublicId}", publicId);
                return string.Empty;
            }
        }

        /// <summary>
        /// Generate a thumbnail URL (smaller size for lists/grids)
        /// </summary>
        public string GetThumbnailUrl(string publicId, int width = 300, int height = 300)
        {
            if (string.IsNullOrEmpty(publicId))
                return string.Empty;

            try
            {
                var url = _cloudinary.Api.UrlImgUp
                    .Transform(new Transformation()
                        .Quality("auto")
                        .FetchFormat("auto")
                        .Width(width)
                        .Height(height)
                        .Crop("fill") // Fill the dimensions
                        .Gravity("auto")) // Auto-detect best crop area
                    .BuildUrl(publicId);

                return url;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating Cloudinary thumbnail URL for: {PublicId}", publicId);
                return string.Empty;
            }
        }
    }
}

