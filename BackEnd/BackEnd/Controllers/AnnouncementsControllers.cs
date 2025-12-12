using BackEnd.Authorization;
using BackEnd.Data;
using BackEnd.Entities;
using BackEnd.Models.Announcements;
using BackEnd.Models.Mappers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BackEnd.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AnnouncementsController : ControllerBase
    {
        private readonly BuyPointDbContext _db;

        public AnnouncementsController(BuyPointDbContext db)
        {
            _db = db;
        }
                [HttpGet]
        [RequirePermission("announcement.read")]
        public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
        {
            var announcements = await _db.Announcements
                .AsNoTracking()
                .OrderByDescending(a => a.Priority)
                .ThenByDescending(a => a.CreatedAt)
                .ToListAsync(cancellationToken);
            
            var announcementDtos = announcements.Select(a => a.ToDto()).ToList();
            return Ok(announcementDtos);
        }
                [HttpGet("active")]
        [AllowAnonymous]
        public async Task<IActionResult> GetActive(CancellationToken cancellationToken)
        {
            var now = DateTime.UtcNow;
            var announcements = await _db.Announcements
                .AsNoTracking()
                .Where(a => a.Status == AnnouncementStatus.Active
                    && a.StartDate <= now
                    && (a.EndDate == null || a.EndDate >= now)
                    && a.Visibility == AnnouncementVisibility.Public)
                .OrderByDescending(a => a.Priority)
                .ThenByDescending(a => a.CreatedAt)
                .ToListAsync(cancellationToken);
            
            var announcementDtos = announcements.Select(a => a.ToDto()).ToList();
            return Ok(announcementDtos);
        }


}