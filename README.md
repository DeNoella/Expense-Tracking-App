# BuyPoint E-Commerce

ASP.NET Core 8.0 Razor Pages + API project template for e-commerce application.

## 🚀 Getting Started

## 📁 Project Structure

```
BuyPoint/
├── Controllers/          # API Controllers (REST endpoints)
├── Data/
│   └── Migrations/       # EF Core database migrations
├── Models/               # Database entities (User, Product, Order, etc.)
├── DTOs/                 # Data Transfer Objects for API
├── Services/             # Business logic layer
├── Pages/                # Razor Pages (UI)
├── wwwroot/              # Static files (CSS, JS, images)
│   └── lib/              # Bootstrap, jQuery
├── appsettings.json      # Configuration (DB connection, JWT, etc.)
└── Program.cs            # App startup & DI configuration
```

## 📦 Installed Packages

| Package                                           | Version | Purpose             |
| ------------------------------------------------- | ------- | ------------------- |
| Microsoft.EntityFrameworkCore                     | 8.0.0   | ORM for database    |
| Microsoft.EntityFrameworkCore.SqlServer           | 8.0.0   | SQL Server provider |
| Microsoft.EntityFrameworkCore.Design              | 8.0.0   | EF migrations       |
| Microsoft.EntityFrameworkCore.Tools               | 8.0.0   | CLI tools           |
| Microsoft.AspNetCore.Authentication.JwtBearer     | 8.0.0   | JWT authentication  |
| Microsoft.AspNetCore.Identity.EntityFrameworkCore | 8.0.0   | User identity       |
| BCrypt.Net-Next                                   | 4.0.3   | Password hashing    |

## 🔧 Setup Steps

### 1. Configure Database Connection

Edit `appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=YOUR_SERVER;Database=BuyPointDB;User Id=YOUR_USER;Password=YOUR_PASSWORD;TrustServerCertificate=True;"
  }
}
```

### 2. Create Models

Add your entity classes in `Models/` folder:

- `User.cs`
- `Product.cs`
- `Order.cs`
- `Category.cs`

### 3. Create DbContext

Add `AppDbContext.cs` in `Data/` folder.

### 4. Run Migrations

```bash
dotnet ef migrations add InitialCreate
dotnet ef database update
```

### 5. Create API Controllers

Add REST API controllers in `Controllers/` folder.

### 6. Create Razor Pages

Add UI pages in `Pages/` folder.

## 📝 License

This project is for educational purposes.
