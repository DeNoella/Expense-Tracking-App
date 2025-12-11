using BackEnd.Authorization;
using BackEnd.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace BackEnd.Data
{
    public static class DbSeeder
    {
        public static async Task SeedAsync(this IServiceProvider services, CancellationToken cancellationToken = default)
        {
            using var scope = services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<BuyPointDbContext>();
            var hasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher<Users>>();

            // Ensure database and all tables are created (including Images table)
            await db.Database.EnsureCreatedAsync(cancellationToken);

            // Delete all users except the admin (cleanup for testing)
            var adminEmail = "aurorenadine25@gmail.com";
            var allUsers = await db.Users.ToListAsync(cancellationToken);
            var usersToDelete = allUsers.Where(u => u.Email != adminEmail).ToList();
            
            if (usersToDelete.Any())
            {
                // Delete users (cascading deletes will handle related data)
                db.Users.RemoveRange(usersToDelete);
                await db.SaveChangesAsync(cancellationToken);
            }

            // Admin email already defined above
            var admin = await db.Users.FirstOrDefaultAsync(u => u.Email == adminEmail, cancellationToken);
            if (admin is null)
            {
                admin = new Users
                {
                    Email = adminEmail,
                    FullName = "Aurore",
                    PasswordHash = hasher.HashPassword(new Users(), "Aurore@123!"),
                    IsEmailVerified = true,
                    // Set all permissions as comma-separated string
                    Permissions = string.Join(",", PermissionConstants.All)
                };
                db.Users.Add(admin);
                await db.SaveChangesAsync(cancellationToken);
            }
            else
            {
                // Update existing admin to have all permissions
                if (string.IsNullOrEmpty(admin.Permissions))
                {
                    admin.Permissions = string.Join(",", PermissionConstants.All);
                    await db.SaveChangesAsync(cancellationToken);
                }
            }

            await db.SaveChangesAsync(cancellationToken);
        }
    }
}

