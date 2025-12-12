using BackEnd.Authorization;
using BackEnd.Data;
using BackEnd.Models.Auth;
using BackEnd.Models.Mappers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Hosting;

namespace BackEnd.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly BuyPointDbContext _db;
        private readonly ILogger<UsersController> _logger;
        private readonly IWebHostEnvironment _environment;

        public UsersController(BuyPointDbContext db, ILogger<UsersController> logger, IWebHostEnvironment environment)
        {
            _db = db;
            _logger = logger;
            _environment = environment;
        }
    }
}
