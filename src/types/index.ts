// Core data models for the application

// User model
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  addresses: Address[];
  orders: string[]; // Order IDs
  createdAt: Date;
  updatedAt: Date;
  role: 'customer' | 'admin';
}

// Address model
export interface Address {
  type: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

// Product model
export interface Product {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  images: string[];
  category: 'seasonal' | 'signature' | 'limited-edition' | 'gift-set' | 'accessories';
  featured: boolean;
  tags: string[];
  rating: {
    average: number;
    count: number;
  };
  customizationOptions: {
    scents: ScentOption[];
    colors: ColorOption[];
    sizes: SizeOption[];
  };
  inventory: {
    quantity: number;
    lowStockThreshold: number;
    isInStock: boolean;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

// Customization option model
export interface CustomizationOption {
  id: string;
  name: string;
  description: string;
  additionalPrice: number;
  available: boolean;
  inStock: boolean;
}

// Scent option extends customization option
export interface ScentOption extends CustomizationOption {
  intensity: 'light' | 'medium' | 'strong';
  notes: string[];
}

// Color option extends customization option
export interface ColorOption extends CustomizationOption {
  hexCode: string;
}

// Size option extends customization option
export interface SizeOption extends CustomizationOption {
  dimensions: string;
  weightOz: number;
  burnTimeHours: number;
}

// Cart model
export interface Cart {
  id: string;
  userId?: string;
  guestId?: string;
  items: CartItem[];
  totalPrice: number;
  createdAt: Date;
  updatedAt: Date;
}

// Cart item model
export interface CartItem {
  product: Product;
  quantity: number;
  customizations: {
    scent?: CustomizationOption;
    color?: ColorOption;
    size?: SizeOption;
  };
  price: number;
}

// Order model
export interface Order {
  id: string;
  orderNumber: string;
  userId?: string;
  email: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  billingAddress: BillingAddress;
  paymentDetails: PaymentDetails;
  subtotal: number;
  tax: number;
  shippingCost: number;
  totalPrice: number;
  status: OrderStatus;
  trackingNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Order item model
export interface OrderItem {
  product: Product;
  productSnapshot: any; // Snapshot of product at time of purchase
  quantity: number;
  customizations: {
    scent?: CustomizationOption;
    color?: ColorOption;
    size?: SizeOption;
  };
  price: number;
}

// Shipping address model
export interface ShippingAddress {
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

// Billing address model
export interface BillingAddress {
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

// Payment details model
export interface PaymentDetails {
  method: string;
  transactionId: string;
  status: string;
}

// Order status enum
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';