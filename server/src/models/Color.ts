/**
 * Color model
 * 
 * This module defines the schema and model for candle colors in the database.
 */

import mongoose, { Schema, Document } from 'mongoose';

// Define the interface for Color document
export interface IColor extends Document {
  name: string;
  hexCode: string;
  description: string;
  image: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Define the schema for Color
const ColorSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Color name is required'],
      trim: true,
      unique: true,
    },
    hexCode: {
      type: String,
      required: [true, 'Hex code is required'],
      match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please provide a valid hex color code'],
    },
    description: {
      type: String,
      default: '',
    },
    image: {
      type: String,
      default: '',
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
ColorSchema.index({ name: 1 });
ColorSchema.index({ active: 1 });

// Create and export the Color model
const Color = mongoose.model<IColor>('Color', ColorSchema);

export default Color;