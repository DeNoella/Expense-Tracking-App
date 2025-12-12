using BackEnd.Authorization;
using BackEnd.Data;
using BackEnd.Models.Permissions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BackEnd.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PermissionsController : ControllerBase
    {
        private readonly BuyPointDbContext _db;

        public PermissionsController(BuyPointDbContext db)
        {
            _db = db;
        }
    }
}
