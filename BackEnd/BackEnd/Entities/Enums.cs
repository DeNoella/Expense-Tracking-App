namespace BackEnd.Entities
{
    // Category Enum
    public enum ProductCategory
    {
        Electronics = 0,
        Clothing = 1,
        Books = 2,
        Home = 3,
        Sports = 4,
        Beauty = 5,
        Food = 6,
        Other = 7
    }

    // User Role/Permission Enum (simplified - stores as comma-separated string in database)
    public enum UserRole
    {
        Customer = 0,
        Admin = 1,
        Manager = 2
    }
}

