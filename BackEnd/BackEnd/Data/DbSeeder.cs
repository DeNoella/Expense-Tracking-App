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

            await db.Database.EnsureCreatedAsync(cancellationToken);
            // Cleanup: Delete all users except the main admin
            var adminEmail = "aurorenadine25@gmail.com";
            var allUsers = await db.Users.ToListAsync(cancellationToken);
            var usersToDelete = allUsers.Where(u => u.Email != adminEmail).ToList();

            if (usersToDelete.Any())
            {
                db.Users.RemoveRange(usersToDelete);
                await db.SaveChangesAsync(cancellationToken);
            }
            var admin = await db.Users.FirstOrDefaultAsync(u => u.Email == adminEmail, cancellationToken);
            if (admin is null)
            {
                admin = new Users
                {
                    Email = adminEmail,
                    FullName = "Aurore",
                    PasswordHash = hasher.HashPassword(new Users(), "Aurore@123!"),
                    IsEmailVerified = true,
                    Permissions = string.Join(",", PermissionConstants.All)
                };

                db.Users.Add(admin);
                await db.SaveChangesAsync(cancellationToken);
            }
