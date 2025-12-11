using BackEnd.Entities;
using BackEnd.Models.Announcements;
using BackEnd.Models.Auth;
using BackEnd.Models.Cart;
using BackEnd.Models.Catalog;
using BackEnd.Models.Discounts;
using BackEnd.Models.Issues;
using BackEnd.Models.Orders;
using BackEnd.Models.Payments;

namespace BackEnd.Models.Mappers
{
    public static class EntityMappers
    {
        public static ProductDto ToDto(this Product product)
        {
            return new ProductDto
            {
                Id = product.Id,
                Category = product.Category,
                CategoryId = (int)product.Category, // Add CategoryId for frontend compatibility
                Name = product.Name,
                Sku = product.Sku,
                Price = product.Price,
                OriginalPrice = product.OriginalPrice,
                StockQty = product.StockQty,
                Stock = product.StockQty, // Add Stock alias for frontend compatibility
                ImageUrl = product.ImageUrl,
                Image = product.ImageUrl, // Add Image alias for frontend compatibility
                Description = product.Description,
                Brand = product.Brand,
                Rating = (double)product.Rating,
                ReviewCount = product.ReviewCount,
                Tags = product.Tags,
                IsActive = product.IsActive,
                CreatedAt = product.CreatedAt,
                UpdatedAt = product.UpdatedAt
            };
        }

        // Category table removed - using ProductCategory enum instead

        public static OrderDto ToDto(this Order order)
        {
            return new OrderDto
            {
                Id = order.Id,
                UserId = order.UserId,
                OrderNumber = order.OrderNumber,
                Status = order.Status,
                Total = order.Total,
                TrackingNumber = order.TrackingNumber,
                EstimatedDelivery = order.EstimatedDelivery,
                ShippingAddressName = order.ShippingAddressName,
                ShippingAddress = order.ShippingAddress,
                ShippingCity = order.ShippingCity,
                ShippingCountry = order.ShippingCountry,
                ShippingPostalCode = order.ShippingPostalCode,
                ShippingPhone = order.ShippingPhone,
                ShippingInstructions = order.ShippingInstructions,
                CreatedAt = order.CreatedAt,
                UpdatedAt = order.UpdatedAt,
                User = order.User != null ? order.User.ToDto() : null,
                Items = order.Items?.Select(i => i.ToDto()).ToList() ?? new List<OrderItemDto>(),
                Payments = order.Payments?.Select(p => p.ToDto()).ToList() ?? new List<PaymentDto>()
            };
        }

        public static OrderItemDto ToDto(this OrderItem orderItem)
        {
            return new OrderItemDto
            {
                Id = orderItem.Id,
                ProductId = orderItem.ProductId,
                UnitPrice = orderItem.UnitPrice,
                Quantity = orderItem.Quantity,
                LineTotal = orderItem.LineTotal,
                Product = orderItem.Product != null ? orderItem.Product.ToDto() : null
            };
        }

        public static CartDto ToDto(this Entities.Cart cart)
        {
            return new CartDto
            {
                Id = cart.Id,
                Items = cart.Items?.Select(i => i.ToDto()).ToList() ?? new List<CartItemDto>()
            };
        }

        public static CartItemDto ToDto(this CartItem cartItem)
        {
            return new CartItemDto
            {
                ProductId = cartItem.ProductId,
                Quantity = cartItem.Quantity,
                Product = cartItem.Product != null ? cartItem.Product.ToDto() : null
            };
        }

        public static PaymentDto ToDto(this Payment payment)
        {
            return new PaymentDto
            {
                Id = payment.Id,
                OrderId = payment.OrderId,
                Method = payment.Method,
                Status = payment.Status,
                Amount = payment.Amount,
                TransactionReference = payment.TransactionReference,
                PaidAt = payment.PaidAt,
                CreatedAt = payment.CreatedAt,
                UpdatedAt = payment.UpdatedAt
            };
        }

        public static UserDto ToDto(this Users user)
        {
            return new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                FullName = user.FullName,
                IsEmailVerified = user.IsEmailVerified,
                IsTwoFactorEnabled = user.IsTwoFactorEnabled,
                TwoFactorMethod = user.TwoFactorMethod,
                CreatedAt = user.CreatedAt,
                UpdatedAt = user.UpdatedAt
            };
        }

        public static IssueDto ToDto(this Issue issue)
        {
            return new IssueDto
            {
                Id = issue.Id,
                OrderId = issue.OrderId,
                OrderItemId = issue.OrderItemId,
                ProductId = issue.ProductId,
                UserId = issue.UserId,
                Title = issue.Title,
                Description = issue.Description,
                Reason = issue.Reason,
                Amount = issue.Amount,
                Status = issue.Status,
                AdminResponse = issue.AdminResponse,
                CreatedAt = issue.CreatedAt,
                UpdatedAt = issue.UpdatedAt,
                Order = issue.Order != null ? issue.Order.ToDto() : null,
                Product = issue.Product != null ? issue.Product.ToDto() : null,
                User = issue.User != null ? issue.User.ToDto() : null
            };
        }

        public static DiscountDto ToDto(this Discount discount)
        {
            return new DiscountDto
            {
                Id = discount.Id,
                Name = discount.Name,
                Type = discount.Type,
                Value = discount.Value,
                ApplicableTo = discount.ApplicableTo,
                Category = discount.Category,
                ProductId = discount.ProductId,
                StartDate = discount.StartDate,
                EndDate = discount.EndDate,
                MinPurchase = discount.MinPurchase,
                MaxDiscount = discount.MaxDiscount,
                Status = discount.Status,
                CreatedAt = discount.CreatedAt,
                UpdatedAt = discount.UpdatedAt,
                Product = discount.Product != null ? discount.Product.ToDto() : null
            };
        }

        public static AnnouncementDto ToDto(this Announcement announcement)
        {
            return new AnnouncementDto
            {
                Id = announcement.Id,
                Title = announcement.Title,
                Message = announcement.Message,
                Type = announcement.Type,
                Status = announcement.Status,
                Visibility = announcement.Visibility,
                Priority = announcement.Priority,
                StartDate = announcement.StartDate,
                EndDate = announcement.EndDate,
                Dismissible = announcement.Dismissible,
                CreatedBy = announcement.CreatedBy,
                CreatedAt = announcement.CreatedAt,
                UpdatedAt = announcement.UpdatedAt
            };
        }

        // PaymentMethod table removed - using PaymentMethodType enum instead
    }
}

