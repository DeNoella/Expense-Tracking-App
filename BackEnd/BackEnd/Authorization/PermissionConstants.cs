namespace BackEnd.Authorization
{
    public static class PermissionConstants
    {
        public const string ClaimType = "permission";
        public const string PolicyPrefix = "PERM:";

        public static readonly string[] All =
        [
            "user.manage",
            "permission.manage",
            "category.read",
            "category.write",
            "product.read",
            "product.write",
            "cart.manage",
            "order.view.own",
            "order.view.any",
            "order.status.update",
            "payment.record",
            "issue.manage",
            "report.export",
            "dashboard.view"
        ];

        public static readonly string[] DefaultCustomerPermissions =
        [
            "category.read",
            "product.read",
            "cart.manage",
            "order.view.own"
        ];
    }
}

