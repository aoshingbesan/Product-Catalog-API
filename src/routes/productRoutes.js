const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductVariants,
  addProductVariant,
  getProductsByCollection,
  searchProducts,
} = require('../controllers/productController');
const { productValidationRules, variantValidationRules } = require('../utils/validators');
const validateRequest = require('../middleware/validateRequest');

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category ID
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum price
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price
 *       - in: query
 *         name: brand
 *         schema:
 *           type: string
 *         description: Filter by brand
 *       - in: query
 *         name: collection
 *         schema:
 *           type: string
 *         description: Filter by collection
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *         description: Filter by tag
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: hasVariants
 *         schema:
 *           type: boolean
 *         description: Filter by variant status
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order
 *       - in: query
 *         name: includeCategories
 *         schema:
 *           type: boolean
 *         description: Include categories in the response
 *       - in: query
 *         name: includeVariants
 *         schema:
 *           type: boolean
 *         description: Include variants in the response
 *     responses:
 *       200:
 *         description: A list of products
 */
router.get('/', getProducts);

/**
 * @swagger
 * /api/products/search:
 *   get:
 *     summary: Search products
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Search results
 */
router.get('/search', searchProducts);

/**
 * @swagger
 * /api/products/collection/{collection}:
 *   get:
 *     summary: Get products by collection
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: collection
 *         required: true
 *         schema:
 *           type: string
 *         description: Collection name
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: A list of products in the collection
 */
router.get('/collection/:collection', getProductsByCollection);

/**
 * @swagger
 * /api/products/slug/{slug}:
 *   get:
 *     summary: Get product by slug
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Product slug
 *       - in: query
 *         name: includeCategories
 *         schema:
 *           type: boolean
 *         description: Include categories in the response
 *       - in: query
 *         name: includeVariants
 *         schema:
 *           type: boolean
 *         description: Include variants in the response
 *     responses:
 *       200:
 *         description: Product details
 *       404:
 *         description: Product not found
 */
router.get('/slug/:slug', getProductBySlug);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *       - in: query
 *         name: includeCategories
 *         schema:
 *           type: boolean
 *         description: Include categories in the response
 *       - in: query
 *         name: includeVariants
 *         schema:
 *           type: boolean
 *         description: Include variants in the response
 *     responses:
 *       200:
 *         description: Product details
 *       404:
 *         description: Product not found
 */
router.get('/:id', getProductById);

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - sku
 *               - basePrice
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               shortDescription:
 *                 type: string
 *               sku:
 *                 type: string
 *               basePrice:
 *                 type: number
 *               compareAtPrice:
 *                 type: number
 *               categories:
 *                 type: array
 *                 items:
 *                   type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               brand:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *               hasVariants:
 *                 type: boolean
 *               collections:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Invalid input
 */
router.post('/', productValidationRules, validateRequest, createProduct);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update a product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               shortDescription:
 *                 type: string
 *               sku:
 *                 type: string
 *               basePrice:
 *                 type: number
 *               compareAtPrice:
 *                 type: number
 *               categories:
 *                 type: array
 *                 items:
 *                   type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               brand:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *               hasVariants:
 *                 type: boolean
 *               collections:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Product not found
 */
router.put('/:id', productValidationRules, validateRequest, updateProduct);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete a product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       404:
 *         description: Product not found
 */
router.delete('/:id', deleteProduct);

/**
 * @swagger
 * /api/products/{id}/variants:
 *   get:
 *     summary: Get product variants
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: List of product variants
 *       404:
 *         description: Product not found
 */
router.get('/:id/variants', getProductVariants);

/**
 * @swagger
 * /api/products/{id}/variants:
 *   post:
 *     summary: Add a variant to a product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - sku
 *               - price
 *               - stockQuantity
 *             properties:
 *               name:
 *                 type: string
 *               sku:
 *                 type: string
 *               attributes:
 *                 type: object
 *               price:
 *                 type: number
 *               compareAtPrice:
 *                 type: number
 *               stockQuantity:
 *                 type: integer
 *               lowStockThreshold:
 *                 type: integer
 *               weight:
 *                 type: number
 *               dimensions:
 *                 type: object
 *                 properties:
 *                   length:
 *                     type: number
 *                   width:
 *                     type: number
 *                   height:
 *                     type: number
 *               isActive:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Variant added successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Product not found
 */
router.post('/:id/variants', variantValidationRules, validateRequest, addProductVariant);

module.exports = router;