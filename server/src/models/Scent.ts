/**
 * Scent model
 * 
 * This module defines the schema and model for candle scents in the database.
 */

import mongoose, { Schema, Document } from 'mongoose';

// Define the interface for Scent document
export interface IScent extends Document {
  name: string;
  description: string;
  category: string;
  intensity: number;
  image: string;
  active: boolean;
  available: boolean;
  inStock: boolean;
  additionalPrice: number;
  createdAt: Date;
  updatedAt: Date;
}

// Define the schema for Scent
const ScentSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Scent name is required'],
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      required: [true, 'Scent description is required'],
    },
    category: {
      type: String,
      required: [true, 'Scent category is required'],
      enum: ['floral', 'fruity', 'woody', 'spicy', 'fresh', 'sweet', 'other'],
    },
    intensity: {
      type: Number,
      required: [true, 'Scent intensity is required'],
      min: [1, 'Intensity must be between 1 and 10'],
      max: [10, 'Intensity must be between 1 and 10'],
    },
    image: {
      type: String,
      default: '',
    },
    active: {
      type: Boolean,
      default: true,
    },
    available: {
      type: Boolean,
      default: true,
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    additionalPrice: {
      type: Number,
      default: 0,
      min: [0, 'Additional price cannot be negative'],
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for frequently queried fields
ScentSchema.index({ name: 1 });
ScentSchema.index({ category: 1 });
ScentSchema.index({ active: 1 });

// Create and export the Scent model
const Scent = mongoose.model<IScent>('Scent', ScentSchema);

export default Scent;