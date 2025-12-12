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
[HttpGet]
[RequirePermission("paymentmethod.read")]
public IActionResult GetAll(CancellationToken cancellationToken)
{
    var paymentMethods = Enum.GetValues(typeof(PaymentMethodType))
        .Cast<PaymentMethodType>()
        .Select(pm => new
        {
            Id = (int)pm,
            Name = pm.ToString(),
            Value = pm
        })
        .ToList();
    
    return Ok(paymentMethods);
}
