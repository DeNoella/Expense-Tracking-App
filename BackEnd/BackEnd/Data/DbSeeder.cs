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
