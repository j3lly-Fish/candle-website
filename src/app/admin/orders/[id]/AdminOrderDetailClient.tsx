'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import OrderStatusUpdate from '@/components/admin/OrderStatusUpdate';
import { useAuth } from '@/contexts/AuthContext';
import { FiArrowLeft, FiPackage, FiMapPin, FiCreditCard, FiUser } from 'react-icons/fi';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface OrderItem {
  _id: string;
  product: {
    _id: string;
    name: string;
  };
  productSnapshot: {
    name: string;
    images: string[];
  };
  quantity: number;
  customizations: {
    scent?: {
      name: string;
      additionalPrice: number;
    };
    color?: {
      name: string;
      hexCode: string;
      additionalPrice: number;
    };
    size?: {
      name: string;
      dimensions: string;
      additionalPrice: number;
    };
  };
  price: number;
}

interface Address {
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  user: {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
  } | null;
  email: string;
  items: OrderItem[];
  shippingAddress: Address;
  billingAddress: Address;
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
  createdAt: string;
  updatedAt: string;
}

interface AdminOrderDetailClientProps {
  orderId: string;
}

const AdminOrderDetailClient: React.FC<AdminOrderDetailClientProps> = ({ orderId }) => {
  const router = useRouter();
  const { user, isLoading: loading } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is admin
    if (!loading && user) {
      if (user.role !== 'admin') {
        router.push('/');
      } else {
        fetchOrder();
      }
    } else if (!loading && !user) {
      router.push('/account/login');
    }
  }, [user, loading, router, fetchOrder]);

  const fetchOrder = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch order details');
      }

      const data = await response.json();
      setOrder(data.data.order);
      setError(null);
    } catch (err) {
      setError('Error loading order details. Please try again.');
      console.error('Order fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading || (!user && !error)) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-700"></div>
      </div>
    );
  }

  return (
    <AdminLayout title={`Order ${order?.orderNumber || orderId}`}>
      <div className="mb-6">
        <Link
          href="/admin/orders"
          className="inline-flex items-center text-sm font-medium text-red-700 hover:text-red-800"
        >
          <FiArrowLeft className="mr-2" />
          Back to Orders
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-700"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-md text-red-700">{error}</div>
      ) : order ? (
        <div className="space-y-6">
          {/* Order Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-lg shadow overflow-hidden"
          >
            <div className="px-6 py-5 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Order {order.orderNumber}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Placed on {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                  <OrderStatusUpdate 
                    orderId={order._id} 
                    currentStatus={order.status} 
                    onStatusUpdate={() => fetchOrder()} 
                  />
                </div>
              </div>
            </div>

            <div className="px-6 py-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center">
                  <FiUser className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Customer</p>
                    <p className="text-sm text-gray-500">
                      {order.user
                        ? `${order.user.firstName} ${order.user.lastName}`
                        : 'Guest'}
                    </p>
                    <p className="text-sm text-gray-500">{order.email}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <FiCreditCard className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Payment</p>
                    <p className="text-sm text-gray-500">
                      {order.paymentDetails.method}
                    </p>
                    <p className="text-sm text-gray-500">
                      {order.paymentDetails.status}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <FiPackage className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Total</p>
                    <p className="text-sm text-gray-500">
                      {formatCurrency(order.totalPrice)}
                    </p>
                    {order.trackingNumber && (
                      <p className="text-sm text-gray-500">
                        Tracking: {order.trackingNumber}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Order Items */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-white rounded-lg shadow overflow-hidden"
          >
            <div className="px-6 py-5 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Order Items</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {order.items.map((item, index) => (
                <div key={index} className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-16 h-16">
                      <img
                        src={item.productSnapshot.images[0] || '/placeholder-image.jpg'}
                        alt={item.productSnapshot.name}
                        className="w-16 h-16 object-cover rounded-md"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                        }}
                      />
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">
                            {item.productSnapshot.name}
                          </h4>
                          <div className="mt-1 text-sm text-gray-500">
                            {item.customizations.scent && (
                              <span className="mr-4">
                                Scent: {item.customizations.scent.name}
                              </span>
                            )}
                            {item.customizations.color && (
                              <span className="mr-4">
                                Color: {item.customizations.color.name}
                              </span>
                            )}
                            {item.customizations.size && (
                              <span>Size: {item.customizations.size.name}</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">
                            Quantity: {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {formatCurrency(item.price)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Addresses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="bg-white rounded-lg shadow overflow-hidden"
            >
              <div className="px-6 py-5 border-b border-gray-200">
                <div className="flex items-center">
                  <FiMapPin className="h-5 w-5 text-gray-400 mr-2" />
                  <h3 className="text-lg font-medium text-gray-900">
                    Shipping Address
                  </h3>
                </div>
              </div>
              <div className="px-6 py-5">
                <address className="text-sm text-gray-900 not-italic">
                  {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                  <br />
                  {order.shippingAddress.street}
                  <br />
                  {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                  {order.shippingAddress.zipCode}
                  <br />
                  {order.shippingAddress.country}
                </address>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="bg-white rounded-lg shadow overflow-hidden"
            >
              <div className="px-6 py-5 border-b border-gray-200">
                <div className="flex items-center">
                  <FiCreditCard className="h-5 w-5 text-gray-400 mr-2" />
                  <h3 className="text-lg font-medium text-gray-900">
                    Billing Address
                  </h3>
                </div>
              </div>
              <div className="px-6 py-5">
                <address className="text-sm text-gray-900 not-italic">
                  {order.billingAddress.firstName} {order.billingAddress.lastName}
                  <br />
                  {order.billingAddress.street}
                  <br />
                  {order.billingAddress.city}, {order.billingAddress.state}{' '}
                  {order.billingAddress.zipCode}
                  <br />
                  {order.billingAddress.country}
                </address>
              </div>
            </motion.div>
          </div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="bg-white rounded-lg shadow overflow-hidden"
          >
            <div className="px-6 py-5 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Order Summary</h3>
            </div>
            <div className="px-6 py-5">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="text-gray-900">
                    {formatCurrency(order.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tax</span>
                  <span className="text-gray-900">{formatCurrency(order.tax)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Shipping</span>
                  <span className="text-gray-900">
                    {formatCurrency(order.shippingCost)}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-2">
                  <div className="flex justify-between text-base font-medium">
                    <span className="text-gray-900">Total</span>
                    <span className="text-gray-900">
                      {formatCurrency(order.totalPrice)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      ) : (
        <div className="bg-gray-50 p-4 rounded-md text-gray-700">
          Order not found.
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminOrderDetailClient;