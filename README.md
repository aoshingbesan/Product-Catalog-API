# Product Catalog API

A comprehensive RESTful API for a product catalog system designed to power e-commerce platforms. This API provides robust endpoints for managing products, categories, inventory, and reporting.

![Product Catalog API Swagger UI Overview](./docs/images/swagger-overview.png)

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Database Setup](#database-setup)
- [API Documentation](#api-documentation)
- [API Endpoints](#api-endpoints)
- [Data Models](#data-models)
- [Error Handling](#error-handling)
- [Testing](#testing)
- [Assumptions and Limitations](#assumptions-and-limitations)

## Features

- **Product Management**: Complete CRUD operations for products with rich metadata support
- **Variant Support**: Manage different product variations (size, color, etc.)
- **Category Management**: Organize products into hierarchical categories
- **Collection Support**: Group products into collections for easier discovery
- **Inventory Management**: Track stock levels with transaction history
- **Advanced Search & Filtering**: Powerful search functionality with multiple filtering options
- **Reporting**: Generate reports for low stock, inventory value, and other business insights

## Tech Stack

- **Node.js**: JavaScript runtime
- **Express.js**: Web application framework
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB object modeling
- **Express Validator**: Input validation
- **Swagger/OpenAPI**: API documentation
- **dotenv**: Environment variable management
- **Morgan**: HTTP request logger middleware

## Project Structure

```
product-catalog-api/
├── src/
│   ├── controllers/      # Request handlers
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   ├── utils/            # Utility functions
│   ├── config/           # Configuration files
│   └── app.js            # Express app setup
├── .env                  # Environment variables
├── .gitignore            # Git ignore file
├── package.json          # Project dependencies
├── server.js             # Server entry point
└── README.md             # Project documentation
```

## Prerequisites

- Node.js (v14+ recommended)
- MongoDB (v4+ recommended)
- npm 


## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd product-catalog-api
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Create a `.env` file in the root directory
   - Add the following variables:
     ```
     PORT=3000
     MONGODB_URI=mongodb://localhost:27017/product_catalog
     NODE_ENV=development
     ```

4. Start the server:
   ```bash
   npm run dev
   ```

## Database Setup

The application uses MongoDB as its database. Here's a view of our MongoDB Compass interface showing our collections:

![MongoDB Compass Collections](./docs/images/mongodb-compass.png)

### Collections Overview:
- **products**: Stores product information
- **categories**: Stores category information
- **variants**: Stores product variants
- **inventorytransactions**: Tracks inventory changes

## API Documentation

The API is documented using Swagger/OpenAPI. Once the server is running, you can access the documentation at:
```
http://localhost:3000/api-docs
```

![Swagger UI Endpoints](./docs/images/swagger-endpoints.png)

The documentation provides a complete overview of all available endpoints, request/response formats, and allows you to test the API directly from the browser.

## API Endpoints

Here are screenshots of some key API endpoints in action:

![API Endpoint Example 1](./docs/images/api-endpoint-1.png)
![API Endpoint Example 2](./docs/images/api-endpoint-2.png)

### Products

- `GET /api/products` - Get all products with filtering and pagination
- `GET /api/products/:id` - Get a specific product by ID
- `GET /api/products/slug/:slug` - Get a specific product by slug
- `POST /api/products` - Create a new product
- `PUT /api/products/:id` - Update a product
- `DELETE /api/products/:id` - Delete a product
- `GET /api/products/search` - Search products by name, description, etc.
- `GET /api/products/collection/:collection` - Get products by collection
- `GET /api/products/:id/variants` - Get variants for a product
- `POST /api/products/:id/variants` - Add a variant to a product

### Categories

- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get a specific category
- `POST /api/categories` - Create a new category
- `PUT /api/categories/:id` - Update a category
- `DELETE /api/categories/:id` - Delete a category

### Inventory

- `POST /api/inventory/update` - Update inventory for a variant
- `GET /api/inventory/levels` - Get current inventory levels
- `GET /api/inventory/transactions` - Get all inventory transactions
- `GET /api/inventory/product/:productId` - Get inventory transactions for a product
- `GET /api/inventory/variant/:variantId` - Get inventory transactions for a variant

### Reports

- `GET /api/reports/low-stock` - Get low stock report
- `GET /api/reports/inventory-value` - Get inventory value report
- `GET /api/reports/inventory-movements` - Get inventory movements report
- `GET /api/reports/catalog-stats` - Get catalog statistics

## Data Models

### Product
```javascript
{
  name: String,               // Product name
  description: String,        // Detailed description
  shortDescription: String,   // Short summary
  slug: String,               // SEO-friendly URL
  sku: String,                // Stock keeping unit
  categories: [ObjectId],     // References to categories
  tags: [String],             // Product tags
  basePrice: Number,          // Base price
  compareAtPrice: Number,     // Compare at price (for discounts)
  featuredImage: {            // Main product image
    url: String,
    alt: String
  },
  images: [{                  // Additional images
    url: String,
    alt: String
  }],
  brand: String,              // Product brand
  isActive: Boolean,          // Whether product is active
  hasVariants: Boolean,       // Whether product has variants
  attributeOptions: Map,      // Available variant options
  collections: [String],      // Product collections
  seo: {                      // SEO metadata
    title: String,
    description: String,
    keywords: [String]
  }
}
```

### Variant
```javascript
{
  product: ObjectId,          // Reference to parent product
  name: String,               // Variant name
  sku: String,                // Variant SKU
  attributes: Map,            // Variant attributes (color, size, etc.)
  price: Number,              // Variant price
  compareAtPrice: Number,     // Compare at price
  stockQuantity: Number,      // Quantity in stock
  lowStockThreshold: Number,  // Low stock alert threshold
  weight: Number,             // Weight
  dimensions: {               // Dimensions
    length: Number,
    width: Number,
    height: Number
  },
  isActive: Boolean,          // Whether variant is active
  images: [{                  // Variant images
    url: String,
    alt: String,
    isDefault: Boolean
  }]
}
```

### Category
```javascript
{
  name: String,               // Category name
  description: String,        // Category description
  parent: ObjectId,           // Parent category (for hierarchy)
  slug: String,               // SEO-friendly URL
  isActive: Boolean           // Whether category is active
}
```

### Inventory Transaction
```javascript
{
  variant: ObjectId,          // Reference to variant
  product: ObjectId,          // Reference to product
  type: String,               // Transaction type (stock_in, stock_out, etc.)
  quantity: Number,           // Transaction quantity
  previousQuantity: Number,   // Stock before transaction
  newQuantity: Number,        // Stock after transaction
  note: String,               // Transaction note
  referenceNumber: String,    // Reference number
  createdBy: String           // User who created the transaction
}
```

## Error Handling

The API provides consistent error responses with appropriate HTTP status codes:

- `400 Bad Request` - Input validation errors
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server-side errors

Error responses follow this format:
```json
{
  "message": "Descriptive error message",
  "stack": "Stack trace (only in development mode)"
}
```

## Testing

You can test the API endpoints using tools like Postman, curl, or directly through the Swagger UI.

Example cURL commands:

### Create a category
```bash
curl -X POST http://localhost:3000/api/categories \
  -H "Content-Type: application/json" \
  -d '{"name": "Electronics", "description": "Electronic devices and accessories"}'
```

### Create a product
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Smartphone X",
    "description": "Latest smartphone with advanced features",
    "shortDescription": "Advanced smartphone",
    "sku": "SP-X-001",
    "basePrice": 699.99,
    "categories": ["60d21b4667d0d8992e610c85"],
    "brand": "TechBrand",
    "tags": ["smartphone", "electronics", "mobile"]
  }'
```

### Update inventory
```bash
curl -X POST http://localhost:3000/api/inventory/update \
  -H "Content-Type: application/json" \
  -d '{
    "variant": "60d21c1b67d0d8992e610c86",
    "product": "60d21b4667d0d8992e610c85",
    "type": "stock_in",
    "quantity": 100,
    "note": "Initial stock"
  }'
```

## Assumptions and Limitations

### Assumptions
1. The API is designed for single-tenant usage and does not include multi-tenant support.
2. Authentication and authorization are not implemented but could be added in future versions.
3. The system assumes product SKUs are unique across the entire catalog.
4. Categories can have a hierarchical structure with parent-child relationships.
5. A product can belong to multiple categories and collections.

### Limitations
1. There is no built-in support for user authentication or role-based access control.
2. Image handling is limited to storing URLs; actual image upload functionality is not implemented.
3. The current implementation doesn't include advanced pricing rules (e.g., tiered pricing, customer-specific pricing).
4. While the API supports product variants, there's no automatic validation that variants have consistent attribute types.
5. The reporting functionality provides basic insights but may need extension for more complex business analytics.

---

© 2023 Product Catalog API. All rights reserved.