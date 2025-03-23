const Category = require('../models/Category');
const { generatePaginationMetadata } = require('../utils/helpers');

/**
 * @desc    Get all categories
 * @route   GET /api/categories
 * @access  Public
 */
const getCategories = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;
    
    // Build filter query
    const filter = {};
    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === 'true';
    }
    
    // Only fetch root categories if specified
    if (req.query.rootOnly === 'true') {
      filter.parent = null;
    }
    
    // Count total documents for pagination
    const totalCategories = await Category.countDocuments(filter);
    
    // Fetch categories with optional population
    let query = Category.find(filter).skip(skip).limit(limit).sort({ name: 1 });
    
    // Populate subcategories if requested
    if (req.query.includeSubcategories === 'true') {
      query = query.populate({
        path: 'subcategories',
        select: 'name description slug isActive',
      });
    }
    
    const categories = await query;
    
    // Generate pagination metadata
    const pagination = generatePaginationMetadata(page, limit, totalCategories);
    
    res.json({
      success: true,
      pagination,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single category by ID
 * @route   GET /api/categories/:id
 * @access  Public
 */
const getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      res.status(404);
      throw new Error('Category not found');
    }
    
    // Populate subcategories if requested
    if (req.query.includeSubcategories === 'true') {
      await category.populate({
        path: 'subcategories',
        select: 'name description slug isActive',
      });
    }
    
    res.json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new category
 * @route   POST /api/categories
 * @access  Private
 */
const createCategory = async (req, res, next) => {
  try {
    // Check if category with the same name already exists
    const existingCategory = await Category.findOne({ name: req.body.name });
    if (existingCategory) {
      res.status(400);
      throw new Error('Category with this name already exists');
    }
    
    const category = await Category.create(req.body);
    
    res.status(201).json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a category
 * @route   PUT /api/categories/:id
 * @access  Private
 */
const updateCategory = async (req, res, next) => {
  try {
    let category = await Category.findById(req.params.id);
    
    if (!category) {
      res.status(404);
      throw new Error('Category not found');
    }
    
    // Check if trying to set parent to itself or one of its subcategories
    if (req.body.parent) {
      if (req.body.parent.toString() === req.params.id) {
        res.status(400);
        throw new Error('Category cannot be its own parent');
      }
      
      // Check if trying to set parent to one of its subcategories
      const subcategories = await Category.find({ parent: req.params.id });
      if (subcategories.some(sub => sub._id.toString() === req.body.parent.toString())) {
        res.status(400);
        throw new Error('Cannot set a subcategory as parent');
      }
    }
    
    // Check for name conflicts if name is being updated
    if (req.body.name && req.body.name !== category.name) {
      const existingCategory = await Category.findOne({ 
        name: req.body.name, 
        _id: { $ne: req.params.id } 
      });
      
      if (existingCategory) {
        res.status(400);
        throw new Error('Category with this name already exists');
      }
    }
    
    category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a category
 * @route   DELETE /api/categories/:id
 * @access  Private
 */
const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      res.status(404);
      throw new Error('Category not found');
    }
    
    // Check if category has subcategories
    const hasSubcategories = await Category.exists({ parent: req.params.id });
    if (hasSubcategories) {
      res.status(400);
      throw new Error('Cannot delete category with subcategories. Update or remove subcategories first.');
    }
    
    await category.remove();
    
    res.json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};