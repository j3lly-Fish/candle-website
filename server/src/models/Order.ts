/**
 * Order model
 * 
 * This module defines the schema and model for orders in the database.
 */

import mongoose, { Schema, Document } from 'mongoose';

// Define the interface for Order document
export interface IOrder extends Document {
  orderNumber: string;
  user: mongoose.Types.ObjectId | null;
  email: string;
  items: Array<{
    product: mongoose.Types.ObjectId;
    productSnapshot: any;
    quantity: number;
    customizations: {
      scent: any;
      color: any;
      size: any;
    };
    price: number;
  }>;
  shippingAddress: {
    firstName: string;
    lastName: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  billingAddress: {
    firstName: string;
    lastName: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentDetails: {
    method: string;
    transactionId: string;
    status: string;
  };
  subtotal: number;
  tax: number;
  shippingCost: number;
  totalPrice: number;
  status: string;
  trackingNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Define the schema for Order
const OrderSchema: Schema = new Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    email: {
      type: String,
      required: true,
    },
    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        productSnapshot: {
          type: Schema.Types.Mixed,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        customizations: {
          scent: {
            type: Schema.Types.Mixed,
          },
          color: {
            type: Schema.Types.Mixed,
          },
          size: {
            type: Schema.Types.Mixed,
          },
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
    shippingAddress: {
      firstName: {
        type: String,
        required: true,
      },
      lastName: {
        type: String,
        required: true,
      },
      street: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      zipCode: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        required: true,
      },
    },
    billingAddress: {
      firstName: {
        type: String,
        required: true,
      },
      lastName: {
        type: String,
        required: true,
      },
      street: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      zipCode: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        required: true,
      },
    },
    paymentDetails: {
      method: {
        type: String,
        required: true,
      },
      transactionId: {
        type: String,
        required: true,
      },
      status: {
        type: String,
        required: true,
        enum: ['pending', 'completed', 'failed', 'refunded'],
      },
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    tax: {
      type: Number,
      required: true,
      min: 0,
    },
    shippingCost: {
      type: Number,
      required: true,
      min: 0,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    trackingNumber: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for frequently queried fields
OrderSchema.index({ orderNumber: 1 });
OrderSchema.index({ user: 1 });
OrderSchema.index({ email: 1 });
OrderSchema.index({ 'paymentDetails.transactionId': 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ createdAt: -1 });

// Generate a unique order number before saving
OrderSchema.pre('save', async function (next) {
  if (this.isNew) {
    // Generate a unique order number if not provided
    if (!this.orderNumber) {
      const date = new Date();
      const year = date.getFullYear().toString().slice(-2);
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      
      this.orderNumber = `ORD-${year}${month}${day}-${random}`;
    }
  }
  next();
});

// Create and export the Order model
const Order = mongoose.model<IOrder>('Order', OrderSchema);

export default Order;