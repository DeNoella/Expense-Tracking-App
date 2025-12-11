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

        [HttpGet]
        [RequirePermission("paymentmethod.read")]
        public IActionResult GetAll(CancellationToken cancellationToken)
        {
            // Return enum values as payment methods
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

        // Payment methods are now enums, so create/update/delete are not applicable
        [HttpGet("{id:int}")]
        [RequirePermission("paymentmethod.read")]
        public IActionResult GetById(int id, CancellationToken cancellationToken)
        {
            if (Enum.IsDefined(typeof(PaymentMethodType), id))
            {
                var pm = (PaymentMethodType)id;
                return Ok(new { Id = id, Name = pm.ToString(), Value = pm });
            }
            return NotFound();
        }

        [HttpPost]
        [RequirePermission("paymentmethod.write")]
        public IActionResult Create(CancellationToken cancellationToken)
        {
            return BadRequest("Payment methods are now enum values. Cannot create new payment methods.");
        }

        [HttpPut("{id:guid}")]
        [RequirePermission("paymentmethod.write")]
        public IActionResult Update(Guid id, CancellationToken cancellationToken)
        {
            return BadRequest("Payment methods are now enum values. Cannot update payment methods.");
        }

        [HttpDelete("{id:guid}")]
        [RequirePermission("paymentmethod.write")]
        public IActionResult Delete(Guid id, CancellationToken cancellationToken)
        {
            return BadRequest("Payment methods are now enum values. Cannot delete payment methods.");
        }
    }
}

