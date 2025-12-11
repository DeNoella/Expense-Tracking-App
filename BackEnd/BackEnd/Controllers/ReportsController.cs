using System.Security.Claims;
using BackEnd.Authorization;
using BackEnd.Data;
using BackEnd.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BackEnd.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReportsController : ControllerBase
    {
        private readonly BuyPointDbContext _db;
        private readonly IPdfService _pdfService;

        public ReportsController(BuyPointDbContext db, IPdfService pdfService)
        {
            _db = db;
            _pdfService = pdfService;
        }

        [HttpGet("orders/{orderId:guid}/invoice")]
        [Authorize]
        public async Task<IActionResult> GetInvoice(Guid orderId, CancellationToken cancellationToken)
        {
            var order = await _db.Orders
                .Include(o => o.User)
                .Include(o => o.Items).ThenInclude(i => i.Product)
                .FirstOrDefaultAsync(o => o.Id == orderId, cancellationToken);

            if (order is null) return NotFound();

            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var canViewAny = User.HasClaim("permission", "report.export");
            if (order.UserId != userId && !canViewAny)
            {
                return Forbid();
            }

            var pdf = _pdfService.GenerateInvoice(order);
            return File(pdf, "application/pdf", $"invoice-{orderId}.pdf");
        }
    }
}

