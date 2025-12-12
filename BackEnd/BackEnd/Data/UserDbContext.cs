using BackEnd.Entities;
using Microsoft.EntityFrameworkCore;

namespace BackEnd.Data
{
    public class BuyPointDbContext(DbContextOptions<BuyPointDbContext> options) : DbContext(options)
    {
        public DbSet<Users> Users => Set<Users>();
        public DbSet<Product> Products => Set<Product>();
        public DbSet<Cart> Carts => Set<Cart>();
        public DbSet<CartItem> CartItems => Set<CartItem>();
        public DbSet<Order> Orders => Set<Order>();
        public DbSet<OrderItem> OrderItems => Set<OrderItem>();
        public DbSet<Payment> Payments => Set<Payment>();
        public DbSet<Issue> Issues => Set<Issue>();
        public DbSet<Discount> Discounts => Set<Discount>();
        public DbSet<Announcement> Announcements => Set<Announcement>();
        public DbSet<Image> Images => Set<Image>();
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Users>()
                .HasIndex(u => u.Email)
                .IsUnique();

            modelBuilder.Entity<Users>()
                .Property(u => u.CreatedAt)
                .HasDefaultValueSql("GETUTCDATE()");

            modelBuilder.Entity<Users>()
                .Property(u => u.UpdatedAt)
                .HasDefaultValueSql("GETUTCDATE()");
