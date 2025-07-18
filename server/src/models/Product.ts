/**
 * Product model
 * 
 * This module defines the schema and model for products in the database.
 */

import mongoose, { Schema, Document } from 'mongoose';

// Define the interface for Product document
export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  images: string[];
  category: string;
  tags: string[];
  stock: number;
  customizationOptions: {
    scents: mongoose.Types.ObjectId[];
    colors: mongoose.Types.ObjectId[];
    sizes: mongoose.Types.ObjectId[];
  };
  featured: boolean;
  rating: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Define the schema for Product
const ProductSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price cannot be negative'],
    },
    discountPrice: {
      type: Number,
      min: [0, 'Discount price cannot be negative'],
    },
    images: {
      type: [String],
      default: [],
    },
    category: {
      type: String,
      required: [true, 'Product category is required'],
    },
    tags: {
      type: [String],
      default: [],
    },
    stock: {
      type: Number,
      required: [true, 'Product stock is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    customizationOptions: {
      scents: [{
        type: Schema.Types.ObjectId,
        ref: 'Scent',
      }],
      colors: [{
        type: Schema.Types.ObjectId,
        ref: 'Color',
      }],
      sizes: [{
        type: Schema.Types.ObjectId,
        ref: 'Size',
      }],
    },
    featured: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      min: [0, 'Rating cannot be negative'],
      max: [5, 'Rating cannot be more than 5'],
      default: 0,
    },
    reviewCount: {
      type: Number,
      min: [0, 'Review count cannot be negative'],
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for frequently queried fields
ProductSchema.index({ name: 'text', description: 'text' });
ProductSchema.index({ category: 1 });
ProductSchema.index({ tags: 1 });
ProductSchema.index({ featured: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ rating: -1 });

// Create and export the Product model
const Product = mongoose.model<IProduct>('Product', ProductSchema);

export default Product;