# E-Commerce Project Folder Structure

This document describes the folder structure for the BuyPoint e-commerce template.

## Main Folders

### 📁 **Models/**
Contains domain models and entity classes for the e-commerce application.
- Product models
- Category models
- Order models
- Cart models
- User/Customer models
- Payment models
- Shipping models

### 📁 **Data/**
Contains database-related code and configurations.
- **Migrations/**: Entity Framework migrations
- **SeedData/**: Database seed data and initial data scripts
- DbContext classes
- Database configuration

### 📁 **Services/**
Contains business logic services.
- **Interfaces/**: Service interfaces
- Product services
- Order services
- Cart services
- Payment services
- Email services
- Authentication services

### 📁 **Repositories/**
Contains data access layer code.
- **Interfaces/**: Repository interfaces
- Product repositories
- Order repositories
- User repositories
- Generic repository implementations

### 📁 **ViewModels/**
Contains view models for passing data to views.
- Product view models
- Cart view models
- Order view models
- Account view models

### 📁 **DTOs/**
Contains Data Transfer Objects for API communication.
- Request DTOs
- Response DTOs
- API models

### 📁 **Infrastructure/**
Contains infrastructure and cross-cutting concerns.
- **Extensions/**: Extension methods
- **Helpers/**: Helper classes and utilities
- Configuration classes
- Middleware
- Custom attributes

### 📁 **Areas/**
Contains area-specific code for organizing large applications.
- **Admin/**: Admin panel pages and functionality
  - **Pages/**: Admin Razor Pages
- **Customer/**: Customer-facing pages
  - **Pages/**: Customer Razor Pages

### 📁 **Pages/**
Main Razor Pages for the application.
- **Products/**: Product listing and detail pages
- **Cart/**: Shopping cart pages
- **Checkout/**: Checkout process pages
- **Account/**: User account management pages
- **Shared/**: Shared layouts and partial views

## Additional Notes

- All folders are ready for implementation
- Follow ASP.NET Core best practices for organizing code
- Use dependency injection for services and repositories
- Implement proper separation of concerns

