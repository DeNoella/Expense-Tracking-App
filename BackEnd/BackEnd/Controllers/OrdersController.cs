using System.Security.Claims;
using BackEnd.Authorization;
using BackEnd.Data;
using BackEnd.Entities;
using BackEnd.Models.Mappers;
using BackEnd.Models.Orders;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BackEnd.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrdersController : ControllerBase
    {
        private readonly BuyPointDbContext _db;
        private readonly ILogger<OrdersController> _logger;

        public OrdersController(BuyPointDbContext db, ILogger<OrdersController> logger)
        {
            _db = db;
            _logger = logger;
        }
    }
}
