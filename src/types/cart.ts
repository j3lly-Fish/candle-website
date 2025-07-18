// Cart types

export interface CartCustomization {
  scent: string | null;
  color: string | null;
  size: string | null;
}

export interface CartItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    images: string[];
    basePrice: number;
  };
  quantity: number;
  customizations: CartCustomization;
  price: number;
}

export interface Cart {
  _id: string;
  user: string | null;
  guestId: string | null;
  items: CartItem[];
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartResponse {
  success: boolean;
  message?: string;
  data: Cart;
}

export interface AddToCartPayload {
  productId: string;
  quantity: number;
  customizations?: {
    scentId?: string | null;
    colorId?: string | null;
    sizeId?: string | null;
  };
}

export interface UpdateCartItemPayload {
  quantity: number;
}

export interface MergeCartPayload {
  guestId: string;
}