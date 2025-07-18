'use client';

import React, { useEffect, useState } from 'react';
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

const AdminOrderDetail = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const { user, loading } = useAuth();
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
  }, [user, loading, router]);

  const fetchOrder = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/admin/orders/${params.id}`, {
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
  };

  const handleStatusUpdate = async (status: string, trackingNumber?: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${params.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ status, trackingNumber }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      // Refresh order data
      fetchOrder();
    } catch (err) {
      console.error('Status update error:', err);
      throw err;
    }
  };

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
    <AdminLayout title={order ? `Order #${order.orderNumber}` : 'Order Details'}>
      <div className="mb-6">
        <Link
          href="/admin/orders"
          className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-red-700"
        >
          <FiArrowLeft className="mr-1" /> Back to Orders
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-700"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-6 rounded-lg text-red-700">{error}</div>
      ) : order ? (
        <div className="space-y-6">
          {/* Order Header */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Order #{order.orderNumber}</h2>
                <p className="text-sm text-gray-500">
                  Placed on {formatDate(order.createdAt)}
                </p>
              </div>
              <div className="mt-4 md:mt-0">
                <span
                  className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusColor(
                    order.status
                  )}`}
                >
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
                {order.trackingNumber && (
                  <div className="mt-2 text-sm text-gray-700">
                    Tracking Number: <span className="font-medium">{order.trackingNumber}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Order Items */}
            <div className="md:col-span-2 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-lg shadow overflow-hidden"
              >
                <div className="px-6 py-4 border-b border-gray-200 flex items-center">
                  <FiPackage className="text-gray-500 mr-2" />
                  <h3 className="text-lg font-medium text-gray-900">Order Items</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {order.items.map((item) => (
                    <div key={item._id} className="p-6 flex flex-col sm:flex-row">
                      <div className="flex-shrink-0 w-full sm:w-24 h-24 mb-4 sm:mb-0">
                        {item.productSnapshot.images && item.productSnapshot.images.length > 0 ? (
                          <img
                            src={item.productSnapshot.images[0]}
                            alt={item.productSnapshot.name}
                            className="w-full h-full object-cover rounded-md"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=No+Image';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center rounded-md">
                            <span className="text-gray-400">No Image</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-grow sm:ml-6">
                        <h4 className="text-lg font-medium text-gray-900">
                          {item.productSnapshot.name}
                        </h4>
                        <div className="mt-1 text-sm text-gray-500">
                          <div>Quantity: {item.quantity}</div>
                          {item.customizations.scent && (
                            <div>Scent: {item.customizations.scent.name}</div>
                          )}
                          {item.customizations.color && (
                            <div className="flex items-center">
                              Color: {item.customizations.color.name}
                              <span
                                className="ml-2 w-4 h-4 rounded-full inline-block border border-gray-200"
                                style={{ backgroundColor: item.customizations.color.hexCode }}
                              ></span>
                            </div>
                          )}
                          {item.customizations.size && (
                            <div>Size: {item.customizations.size.name}</div>
                          )}
                        </div>
                      </div>
                      <div className="mt-4 sm:mt-0 text-right">
                        <div className="text-lg font-medium text-gray-900">
                          {formatCurrency(item.price)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatCurrency(item.price / item.quantity)} each
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">{formatCurrency(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium">{formatCurrency(order.tax)}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">{formatCurrency(order.shippingCost)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold mt-4 pt-4 border-t border-gray-200">
                    <span>Total</span>
                    <span>{formatCurrency(order.totalPrice)}</span>
                  </div>
                </div>
              </motion.div>

              {/* Customer Information */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="bg-white rounded-lg shadow overflow-hidden"
              >
                <div className="px-6 py-4 border-b border-gray-200 flex items-center">
                  <FiUser className="text-gray-500 mr-2" />
                  <h3 className="text-lg font-medium text-gray-900">Customer Information</h3>
                </div>
                <div className="p-6">
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Customer</h4>
                    <p className="text-gray-900">
                      {order.user ? (
                        <>
                          {order.user.firstName} {order.user.lastName}
                          <br />
                          <a href={`mailto:${order.user.email}`} className="text-blue-600">
                            {order.user.email}
                          </a>
                        </>
                      ) : (
                        <>
                          Guest
                          <br />
                          <a href={`mailto:${order.email}`} className="text-blue-600">
                            {order.email}
                          </a>
                        </>
                      )}
                    </p>
                  </div>
                  {order.user && (
                    <div>
                      <Link
                        href={`/admin/users/${order.user._id}`}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        View Customer Profile
                      </Link>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            <div className="space-y-6">
              {/* Order Status Update */}
              <OrderStatusUpdate
                orderId={order._id}
                currentStatus={order.status}
                onStatusUpdate={handleStatusUpdate}
              />

              {/* Shipping Address */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="bg-white rounded-lg shadow overflow-hidden"
              >
                <div className="px-6 py-4 border-b border-gray-200 flex items-center">
                  <FiMapPin className="text-gray-500 mr-2" />
                  <h3 className="text-lg font-medium text-gray-900">Shipping Address</h3>
                </div>
                <div className="p-6">
                  <p className="text-gray-900">
                    {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                    <br />
                    {order.shippingAddress.street}
                    <br />
                    {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                    {order.shippingAddress.zipCode}
                    <br />
                    {order.shippingAddress.country}
                  </p>
                </div>
              </motion.div>

              {/* Billing Address */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                className="bg-white rounded-lg shadow overflow-hidden"
              >
                <div className="px-6 py-4 border-b border-gray-200 flex items-center">
                  <FiCreditCard className="text-gray-500 mr-2" />
                  <h3 className="text-lg font-medium text-gray-900">Billing Information</h3>
                </div>
                <div className="p-6">
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Payment Method</h4>
                    <p className="text-gray-900">{order.paymentDetails.method}</p>
                    {order.paymentDetails.transactionId && (
                      <p className="text-sm text-gray-500">
                        Transaction ID: {order.paymentDetails.transactionId}
                      </p>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Billing Address</h4>
                    <p className="text-gray-900">
                      {order.billingAddress.firstName} {order.billingAddress.lastName}
                      <br />
                      {order.billingAddress.street}
                      <br />
                      {order.billingAddress.city}, {order.billingAddress.state}{' '}
                      {order.billingAddress.zipCode}
                      <br />
                      {order.billingAddress.country}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 p-6 rounded-lg text-yellow-700">Order not found</div>
      )}
    </AdminLayout>
  );
};

export default AdminOrderDetail;