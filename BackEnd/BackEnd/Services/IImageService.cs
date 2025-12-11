namespace BackEnd.Services
{
    public interface IImageService
    {
        Task<string> SaveImageAsync(Stream fileStream, string fileName, string contentType, CancellationToken cancellationToken = default);
        Task<bool> DeleteImageAsync(string filePath, CancellationToken cancellationToken = default);
        string GetImageUrl(string filePath);
    }
}





