using BackEnd.Authorization; 
using BackEnd.Data;
using BackEnd.Entities;
using BackEnd.Models.Payments;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BackEnd.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PaymentsController : ControllerBase
    {
        private readonly BuyPointDbContext _db;

        public PaymentsController(BuyPointDbContext db)
        {
            _db = db;
        }
    }
}
