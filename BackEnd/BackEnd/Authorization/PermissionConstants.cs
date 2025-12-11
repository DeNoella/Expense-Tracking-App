namespace BackEnd.Authorization
{
    public static class PermissionConstants
    {
        public const string ClaimType = "permission";
        public const string PolicyPrefix = "PERM:";

        // All available permissions
        public static readonly string[] All =
        [
            // User Management
            "user.manage",
            "user.view.any",
            "permission.manage",
            
            // Catalog Management
            "category.read",
            "category.write",
            "product.read",
            "product.write",
            
            // Shopping
            "cart.manage",
            "order.view.own",
            "order.view.any",
            "order.status.update",
            
            // Payments & Refunds
            "payment.record",
            "payment.view",
            "refund.manage",
            "refund.approve",
            "refund.view",
            
            // Issues & Support
            "issue.manage",
            "issue.view",
            "issue.resolve",
            
            // Reports & Analytics
            "report.export",
            "report.view",
            "analytics.view",
            
            // Dashboard
            "dashboard.view",
            "dashboard.admin",
            
            // Discounts & Promotions
            "discount.read",
            "discount.write",
            
            // Payment Methods
            "paymentmethod.read",
            "paymentmethod.write",
            
            // Announcements
            "announcement.read",
            "announcement.write",
            
            // System Management
            "system.info.view",
            "system.settings.manage",
            "system.logs.view"
        ];

        // Default permissions for regular customers
        public static readonly string[] DefaultCustomerPermissions =
        [
            "category.read",
            "product.read",
            "cart.manage",
            "order.view.own"
        ];

        // Permission descriptions for UI display
        public static readonly Dictionary<string, string> Descriptions = new()
        {
            // User Management
            ["user.manage"] = "Create, edit, and delete users",
            ["user.view.any"] = "View any user's information",
            ["permission.manage"] = "Assign and manage user permissions",
            
            // Catalog Management
            ["category.read"] = "View product categories",
            ["category.write"] = "Create and edit categories",
            ["product.read"] = "View products",
            ["product.write"] = "Create and edit products",
            
            // Shopping
            ["cart.manage"] = "Manage shopping cart",
            ["order.view.own"] = "View own orders",
            ["order.view.any"] = "View any user's orders",
            ["order.status.update"] = "Update order status",
            
            // Payments & Refunds
            ["payment.record"] = "Record payments",
            ["payment.view"] = "View payment information",
            ["refund.manage"] = "Manage refunds",
            ["refund.approve"] = "Approve refund requests",
            ["refund.view"] = "View refund information",
            
            // Issues & Support
            ["issue.manage"] = "Manage customer issues",
            ["issue.view"] = "View customer issues",
            ["issue.resolve"] = "Resolve customer issues",
            
            // Reports & Analytics
            ["report.export"] = "Export reports",
            ["report.view"] = "View reports",
            ["analytics.view"] = "View analytics and statistics",
            
            // Dashboard
            ["dashboard.view"] = "View dashboard",
            ["dashboard.admin"] = "View admin dashboard",
            
            // Discounts & Promotions
            ["discount.read"] = "View discounts",
            ["discount.write"] = "Create and edit discounts",
            
            // Payment Methods
            ["paymentmethod.read"] = "View payment methods",
            ["paymentmethod.write"] = "Manage payment methods",
            
            // Announcements
            ["announcement.read"] = "View announcements",
            ["announcement.write"] = "Create and edit announcements",
            
            // System Management
            ["system.info.view"] = "View system information",
            ["system.settings.manage"] = "Manage system settings",
            ["system.logs.view"] = "View system logs"
        };

        // Permission groups for UI organization
        public static readonly Dictionary<string, string[]> PermissionGroups = new()
        {
            ["User Management"] = ["user.manage", "user.view.any", "permission.manage"],
            ["Catalog"] = ["category.read", "category.write", "product.read", "product.write"],
            ["Orders"] = ["order.view.own", "order.view.any", "order.status.update", "cart.manage"],
            ["Payments & Refunds"] = ["payment.record", "payment.view", "refund.manage", "refund.approve", "refund.view"],
            ["Issues & Support"] = ["issue.manage", "issue.view", "issue.resolve"],
            ["Reports & Analytics"] = ["report.export", "report.view", "analytics.view"],
            ["Dashboard"] = ["dashboard.view", "dashboard.admin"],
            ["Discounts"] = ["discount.read", "discount.write"],
            ["Payment Methods"] = ["paymentmethod.read", "paymentmethod.write"],
            ["Announcements"] = ["announcement.read", "announcement.write"],
            ["System"] = ["system.info.view", "system.settings.manage", "system.logs.view"]
        };
    }
}

