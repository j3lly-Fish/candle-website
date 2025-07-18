/**
 * Cart model
 * 
 * This module defines the schema and model for shopping carts in the database.
 */

import mongoose, { Schema, Document } from 'mongoose';

// Define the interface for Cart document
export interface ICart extends Document {
  user: mongoose.Types.ObjectId | null;
  sessionId: string;
  items: Array<{
    product: mongoose.Types.ObjectId;
    quantity: number;
    customizations: {
      scent: mongoose.Types.ObjectId | null;
      color: mongoose.Types.ObjectId | null;
      size: mongoose.Types.ObjectId | null;
    };
  }>;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
}

// Define the schema for Cart
const CartSchema: Schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    sessionId: {
      type: String,
      required: function(this: any) {
        return this.user === null;
      },
    },
    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, 'Quantity cannot be less than 1'],
        },
        customizations: {
          scent: {
            type: Schema.Types.ObjectId,
            ref: 'Scent',
            default: null,
          },
          color: {
            type: Schema.Types.ObjectId,
            ref: 'Color',
            default: null,
          },
          size: {
            type: Schema.Types.ObjectId,
            ref: 'Size',
            default: null,
          },
        },
      },
    ],
    expiresAt: {
      type: Date,
      default: function(this: any) {
        // Set expiration to 7 days from now
        const date = new Date();
        date.setDate(date.getDate() + 7);
        return date;
      },
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for frequently queried fields
CartSchema.index({ user: 1 });
CartSchema.index({ sessionId: 1 });
CartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index for automatic expiration

// Create and export the Cart model
const Cart = mongoose.model<ICart>('Cart', CartSchema);

export default Cart;