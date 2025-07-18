/**
 * Size model
 * 
 * This module defines the schema and model for candle sizes in the database.
 */

import mongoose, { Schema, Document } from 'mongoose';

// Define the interface for Size document
export interface ISize extends Document {
  name: string;
  description: string;
  dimensions: {
    height: number;
    diameter: number;
    unit: string;
  };
  weightOz: number;
  burnTimeHours: number;
  priceModifier: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Define the schema for Size
const SizeSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Size name is required'],
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      default: '',
    },
    dimensions: {
      height: {
        type: Number,
        required: [true, 'Height is required'],
        min: [0, 'Height cannot be negative'],
      },
      diameter: {
        type: Number,
        required: [true, 'Diameter is required'],
        min: [0, 'Diameter cannot be negative'],
      },
      unit: {
        type: String,
        required: [true, 'Unit is required'],
        enum: ['in', 'cm'],
        default: 'in',
      },
    },
    weightOz: {
      type: Number,
      required: [true, 'Weight is required'],
      min: [0, 'Weight cannot be negative'],
    },
    burnTimeHours: {
      type: Number,
      required: [true, 'Burn time is required'],
      min: [0, 'Burn time cannot be negative'],
    },
    priceModifier: {
      type: Number,
      required: [true, 'Price modifier is required'],
      default: 0,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for frequently queried fields
SizeSchema.index({ name: 1 });
SizeSchema.index({ active: 1 });

// Create and export the Size model
const Size = mongoose.model<ISize>('Size', SizeSchema);

export default Size;