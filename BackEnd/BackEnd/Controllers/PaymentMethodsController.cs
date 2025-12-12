using BackEnd.Authorization;
using BackEnd.Data;
using BackEnd.Entities;
using BackEnd.Models.Mappers;
using BackEnd.Models.PaymentMethods;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BackEnd.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PaymentMethodsController : ControllerBase
    {
        private readonly BuyPointDbContext _db;

        public PaymentMethodsController(BuyPointDbContext db)
        {
            _db = db;
        }
    }
}
