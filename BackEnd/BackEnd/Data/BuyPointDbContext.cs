using BackEnd.Entities;
using Microsoft.EntityFrameworkCore;

namespace BackEnd.Data
{
    public class BuyPointDbContext(DbContextOptions<BuyPointDbContext> options) : DbContext(options)
    {
        public DbSet<Users> Users => Set<Users>();
        public DbSet<Permission> Permissions => Set<Permission>();
        public DbSet<UserPermission> UserPermissions => Set<UserPermission>();
        public DbSet<Otp> Otps => Set<Otp>();
        public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Users>()
                .HasIndex(u => u.Email)
                .IsUnique();


            modelBuilder.Entity<Permission>()
                .HasIndex(p => p.Key)
                .IsUnique();

            modelBuilder.Entity<UserPermission>()
                .HasKey(up => new { up.UserId, up.PermissionId });

            modelBuilder.Entity<UserPermission>()
                .HasOne(up => up.User)
                .WithMany(u => u.Permissions)
                .HasForeignKey(up => up.UserId);

            modelBuilder.Entity<UserPermission>()
                .HasOne(up => up.Permission)
                .WithMany(p => p.UserPermissions)
                .HasForeignKey(up => up.PermissionId);

            base.OnModelCreating(modelBuilder);
        }
    }
}
