const Product = require('../models/Product');
const Variant = require('../models/Variant');
const { 
  buildProductFilterQuery, 
  buildSortObject, 
  generatePaginationMetadata 
} = require('../utils/helpers');

/**
 * @desc    Get all products
 * @route   GET /api/products
 * @access  Public
 */
const getProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;
    
    // Build filter query from request parameters
    const filter = buildProductFilterQuery(req.query);
    
    // Determine sort field and order
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder || 'desc';
    const sortOptions = buildSortObject(sortBy, sortOrder);
    
    // Handle text search projection
    const projection = req.query.search ? { score: { $meta: 'textScore' } } : {};
    
    // Count total documents for pagination
    const totalProducts = await Product.countDocuments(filter);
    
    // Execute query
    let query = Product.find(filter, projection)
      .skip(skip)
      .limit(limit)
      .sort(sortOptions);
    
    // Populate categories if requested
    if (req.query.includeCategories === 'true') {
      query = query.populate('categories', 'name slug');
    }
    
    // Populate variants if requested
    if (req.query.includeVariants === 'true') {
      query = query.populate('variants');
    }
    
    const products = await query;
    
    // Generate pagination metadata
    const pagination = generatePaginationMetadata(page, limit, totalProducts);
    
    res.json({
      success: true,
      pagination,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single product by ID
 * @route   GET /api/products/:id
 * @access  Public
 */
const getProductById = async (req, res, next) => {
  try {
    let query = Product.findById(req.params.id);
    
    // Populate categories if requested
    if (req.query.includeCategories === 'true') {
      query = query.populate('categories', 'name slug');
    }
    
    // Populate variants if requested
    if (req.query.includeVariants === 'true') {
      query = query.populate('variants');
    }
    
    const product = await query;
    
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }
    
    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single product by slug
 * @route   GET /api/products/slug/:slug
 * @access  Public
 */
const getProductBySlug = async (req, res, next) => {
  try {
    let query = Product.findOne({ slug: req.params.slug });
    
    // Populate categories if requested
    if (req.query.includeCategories === 'true') {
      query = query.populate('categories', 'name slug');
    }
    
    // Populate variants if requested
    if (req.query.includeVariants === 'true') {
      query = query.populate('variants');
    }
    
    const product = await query;
    
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }
    
    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new product
 * @route   POST /api/products
 * @access  Private
 */
const createProduct = async (req, res, next) => {
  try {
    // Check if product with the same SKU already exists
    const existingProduct = await Product.findOne({ sku: req.body.sku });
    if (existingProduct) {
      res.status(400);
      throw new Error('Product with this SKU already exists');
    }
    
    const product = await Product.create(req.body);
    
    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a product
 * @route   PUT /api/products/:id
 * @access  Private
 */
const updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);
    
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }
    
    // Check for SKU conflicts if SKU is being updated
    if (req.body.sku && req.body.sku !== product.sku) {
      const existingProduct = await Product.findOne({ 
        sku: req.body.sku, 
        _id: { $ne: req.params.id } 
      });
      
      if (existingProduct) {
        res.status(400);
        throw new Error('Product with this SKU already exists');
      }
    }
    
    product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a product
 * @route   DELETE /api/products/:id
 * @access  Private
 */
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }
    
    // Delete associated variants
    await Variant.deleteMany({ product: req.params.id });
    
    // Delete the product
    await product.remove();
    
    res.json({
      success: true,
      message: 'Product and its variants deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get product variants
 * @route   GET /api/products/:id/variants
 * @access  Public
 */
const getProductVariants = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }
    
    const variants = await Variant.find({ product: req.params.id });
    
    res.json({
      success: true,
      data: variants,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add a variant to a product
 * @route   POST /api/products/:id/variants
 * @access  Private
 */
const addProductVariant = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }
    
    // Check if variant with the same SKU already exists
    const existingVariant = await Variant.findOne({ sku: req.body.sku });
    if (existingVariant) {
      res.status(400);
      throw new Error('Variant with this SKU already exists');
    }
    
    // Add product ID to the variant data
    req.body.product = req.params.id;
    
    // Create the variant
    const variant = await Variant.create(req.body);
    
    // Update product to indicate it has variants
    if (!product.hasVariants) {
      await Product.findByIdAndUpdate(
        req.params.id,
        { hasVariants: true },
        { new: true }
      );
    }
    
    res.status(201).json({
      success: true,
      data: variant,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get products by collection
 * @route   GET /api/products/collection/:collection
 * @access  Public
 */
const getProductsByCollection = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;
    
    const collection = req.params.collection;
    
    // Build filter with collection
    const filter = { collections: collection, ...buildProductFilterQuery(req.query) };
    
    // Count total documents for pagination
    const totalProducts = await Product.countDocuments(filter);
    
    // Execute query
    let query = Product.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    // Populate categories if requested
    if (req.query.includeCategories === 'true') {
      query = query.populate('categories', 'name slug');
    }
    
    const products = await query;
    
    // Generate pagination metadata
    const pagination = generatePaginationMetadata(page, limit, totalProducts);
    
    res.json({
      success: true,
      pagination,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Search products
 * @route   GET /api/products/search
 * @access  Public
 */
const searchProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;
    
    if (!req.query.q) {
      res.status(400);
      throw new Error('Search query is required');
    }
    
    // Create text search query
    const filter = {
      $text: { $search: req.query.q },
      ...buildProductFilterQuery(req.query),
    };
    
    // Count total documents for pagination
    const totalProducts = await Product.countDocuments(filter);
    
    // Execute query with text score sorting
    const products = await Product.find(filter, { score: { $meta: 'textScore' } })
      .skip(skip)
      .limit(limit)
      .sort({ score: { $meta: 'textScore' } });
    
    // Generate pagination metadata
    const pagination = generatePaginationMetadata(page, limit, totalProducts);
    
    res.json({
      success: true,
      pagination,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};