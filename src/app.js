const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Database connection
require('./config/db');

// Import routes
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const reportRoutes = require('./routes/reportRoutes');

// Import middleware
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Product Catalog API',
      version: '1.0.0',
      description: 'A RESTful API for a product catalog system',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
      },
    ],
  },
  apis: ['./src/routes/*.js'], // Path to the API routes
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan('dev'));

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/reports', reportRoutes);

// Welcome route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Product Catalog API',
    documentation: '/api-docs',
  });
});

// Error handling middleware
app.use(errorHandler);

module.exports = app;