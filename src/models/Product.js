const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [200, 'Product name cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true,
    },
    shortDescription: {
      type: String,
      trim: true,
      maxlength: [300, 'Short description cannot exceed 300 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    sku: {
      type: String,
      unique: true,
      trim: true,
      required: [true, 'SKU is required'],
    },
    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
      },
    ],
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    basePrice: {
      type: Number,
      required: [true, 'Base price is required'],
      min: [0, 'Base price cannot be negative'],
    },
    compareAtPrice: {
      type: Number,
      min: [0, 'Compare at price cannot be negative'],
      default: null,
    },
    featuredImage: {
      url: {
        type: String,
      },
      alt: {
        type: String,
        default: '',
      },
    },
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        alt: {
          type: String,
          default: '',
        },
      },
    ],
    brand: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    hasVariants: {
      type: Boolean,
      default: false,
    },
    attributeOptions: {
      // Store available attribute options for variants (e.g., available sizes, colors)
      type: Map,
      of: [String],
      default: {},
    },
    collections: [
      {
        type: String,
        trim: true,
      },
    ],
    seo: {
      title: {
        type: String,
        trim: true,
      },
      description: {
        type: String,
        trim: true,
      },
      keywords: [
        {
          type: String,
          trim: true,
        },
      ],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for variants
ProductSchema.virtual('variants', {
  ref: 'Variant',
  localField: '_id',
  foreignField: 'product',
});

// Virtual for discount percentage
ProductSchema.virtual('discountPercentage').get(function () {
  if (this.compareAtPrice && this.compareAtPrice > this.basePrice) {
    return Math.round(((this.compareAtPrice - this.basePrice) / this.compareAtPrice) * 100);
  }
  return 0;
});

// Pre-save middleware to create slug from name
ProductSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
  next();
});

// Text index for search functionality
ProductSchema.index(
  {
    name: 'text',
    description: 'text',
    shortDescription: 'text',
    'seo.keywords': 'text',
    brand: 'text',
    collections: 'text',
    tags: 'text',
  },
  {
    weights: {
      name: 10,
      'seo.keywords': 5,
      shortDescription: 3,
      description: 1,
      brand: 2,
      collections: 2,
      tags: 2,
    },
  }
);

// Additional indexes for efficient querying
ProductSchema.index({ slug: 1 });
ProductSchema.index({ sku: 1 });
ProductSchema.index({ categories: 1 });
ProductSchema.index({ isActive: 1 });
ProductSchema.index({ collections: 1 });
ProductSchema.index({ brand: 1 });
ProductSchema.index({ 'attributeOptions.Color': 1 });
ProductSchema.index({ 'attributeOptions.Size': 1 });
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ updatedAt: -1 });

module.exports = mongoose.model('Product', ProductSchema);