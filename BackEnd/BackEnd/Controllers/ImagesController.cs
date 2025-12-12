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
