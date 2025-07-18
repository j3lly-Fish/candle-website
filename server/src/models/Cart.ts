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
    _id?: mongoose.Types.ObjectId;
    product: mongoose.Types.ObjectId;
    quantity: number;
    price: number;
    customizations: {
      scent: mongoose.Types.ObjectId | null;
      color: mongoose.Types.ObjectId | null;
      size: mongoose.Types.ObjectId | null;
    };
  }>;
  totalPrice: number;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
}

// Define static methods interface
export interface ICartModel extends mongoose.Model<ICart> {
  findByUser(userId: mongoose.Types.ObjectId): Promise<ICart | null>;
  findByGuestId(sessionId: string): Promise<ICart | null>;
  findOrCreateCart(userId: mongoose.Types.ObjectId | null, sessionId?: string): Promise<ICart>;
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
        price: {
          type: Number,
          required: true,
          min: [0, 'Price cannot be negative'],
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
    totalPrice: {
      type: Number,
      default: 0,
      min: [0, 'Total price cannot be negative'],
    },
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

// Static methods
CartSchema.statics.findByUser = function(userId: mongoose.Types.ObjectId) {
  return this.findOne({ user: userId });
};

CartSchema.statics.findByGuestId = function(sessionId: string) {
  return this.findOne({ sessionId: sessionId, user: null });
};

CartSchema.statics.findOrCreateCart = async function(userId: mongoose.Types.ObjectId | null, sessionId?: string) {
  let cart;
  
  if (userId) {
    cart = await this.findOne({ user: userId });
    if (!cart) {
      cart = new this({ user: userId, items: [], totalPrice: 0 });
      await cart.save();
    }
  } else if (sessionId) {
    cart = await this.findOne({ sessionId: sessionId, user: null });
    if (!cart) {
      cart = new this({ sessionId: sessionId, items: [], totalPrice: 0 });
      await cart.save();
    }
  } else {
    throw new Error('Either userId or sessionId must be provided');
  }
  
  return cart;
};

// Create and export the Cart model
const Cart = mongoose.model<ICart, ICartModel>('Cart', CartSchema);

export default Cart;