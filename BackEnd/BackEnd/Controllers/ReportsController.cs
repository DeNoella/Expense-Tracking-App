using BackEnd.Authorization;
using BackEnd.Data;
using BackEnd.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

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
    }
}
