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

        [HttpPost]
        [RequirePermission("payment.record")]
        public async Task<IActionResult> Record([FromBody] PaymentRequest request, CancellationToken cancellationToken)
        {
            var order = await _db.Orders.Include(o => o.Payments).FirstOrDefaultAsync(o => o.Id == request.OrderId, cancellationToken);
            if (order is null) return NotFound("Order not found");

            var payment = new Payment
            {
                OrderId = order.Id,
                Method = request.Method,
                Amount = request.Amount,
                TransactionReference = request.TransactionReference,
                Status = PaymentStatus.Completed,
                PaidAt = DateTime.UtcNow
            };

            order.Payments.Add(payment);
            order.Status = OrderStatus.Paid;
            order.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync(cancellationToken);
            return Ok(payment);
        }
    }
}

