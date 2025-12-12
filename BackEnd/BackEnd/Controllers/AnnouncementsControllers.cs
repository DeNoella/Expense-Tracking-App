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
            [HttpGet("{id:guid}")]
        [RequirePermission("announcement.read")]
        public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
        {
            var announcement = await _db.Announcements
                .AsNoTracking()
                .FirstOrDefaultAsync(a => a.Id == id, cancellationToken);
            if (announcement is null) return NotFound();
            return Ok(announcement.ToDto());
        }
            [HttpPost]
        [RequirePermission("announcement.write")]
        public async Task<IActionResult> Create([FromBody] AnnouncementRequest request, CancellationToken cancellationToken)
        {
            var announcement = new Announcement
            {
                Title = request.Title,
                Message = request.Message,
                Type = request.Type,
                Status = request.Status,
                Visibility = request.Visibility,
                Priority = request.Priority,
                StartDate = request.StartDate,
                EndDate = request.EndDate,
                Dismissible = request.Dismissible,
                CreatedBy = request.CreatedBy
            };

            _db.Announcements.Add(announcement);
            await _db.SaveChangesAsync(cancellationToken);
            return CreatedAtAction(nameof(GetById), new { id = announcement.Id }, announcement.ToDto());
        }
        [HttpPut("{id:guid}")]
        [RequirePermission("announcement.write")]
        public async Task<IActionResult> Update(Guid id, [FromBody] AnnouncementRequest request, CancellationToken cancellationToken)
        {
            var announcement = await _db.Announcements.FindAsync(new object?[] { id }, cancellationToken);
            if (announcement is null) return NotFound();

            announcement.Title = request.Title;
            announcement.Message = request.Message;
            announcement.Type = request.Type;
            announcement.Status = request.Status;
            announcement.Visibility = request.Visibility;
            announcement.Priority = request.Priority;
            announcement.StartDate = request.StartDate;
            announcement.EndDate = request.EndDate;
            announcement.Dismissible = request.Dismissible;
            announcement.CreatedBy = request.CreatedBy;
            announcement.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync(cancellationToken);
            return Ok(announcement.ToDto());
        }
        [HttpDelete("{id:guid}")]
        [RequirePermission("announcement.write")]
        public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
        {
            var announcement = await _db.Announcements.FindAsync(new object?[] { id }, cancellationToken);
            if (announcement is null) return NotFound();

            _db.Announcements.Remove(announcement);
            await _db.SaveChangesAsync(cancellationToken);
            return NoContent();
        }
    }


}