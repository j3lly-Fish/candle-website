'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { FiArrowLeft, FiUser, FiShoppingBag, FiMapPin } from 'react-icons/fi';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface Address {
  _id: string;
  type: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

interface Order {
  _id: string;
  orderNumber: string;
  totalPrice: number;
  status: string;
  createdAt: string;
}

interface UserDetails {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  addresses: Address[];
  orders: string[];
  createdAt: string;
  updatedAt: string;
  isActive?: boolean;
  lastLogin?: string;
}

interface AdminUserDetailClientProps {
  userId: string;
}

const AdminUserDetailClient: React.FC<AdminUserDetailClientProps> = ({ userId }) => {
  const router = useRouter();
  const { user, isLoading: loading } = useAuth();
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is admin
    if (!loading && user) {
      if (user.role !== 'admin') {
        router.push('/');
      } else {
        fetchUserDetails();
      }
    } else if (!loading && !user) {
      router.push('/account/login');
    }
  }, [user, loading, router, fetchUserDetails]);

  const fetchUserDetails = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/admin/users/${userId}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user details');
      }

      const data = await response.json();
      setUserDetails(data.data.user);
      setOrders(data.data.orders || []);
      setError(null);
    } catch (err) {
      setError('Error loading user details. Please try again.');
      console.error('User fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

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
    });
  };

  if (loading || (!user && !error)) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-700"></div>
      </div>
    );
  }

  return (
    <AdminLayout title={`User ${userDetails?.firstName || userId}`}>
      <div className="mb-6">
        <Link
          href="/admin/users"
          className="inline-flex items-center text-sm font-medium text-red-700 hover:text-red-800"
        >
          <FiArrowLeft className="mr-2" />
          Back to Users
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-700"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-md text-red-700">{error}</div>
      ) : userDetails ? (
        <div className="space-y-6">
          {/* User Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-lg shadow overflow-hidden"
          >
            <div className="px-6 py-5 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FiUser className="h-8 w-8 text-gray-400 mr-3" />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {userDetails.firstName} {userDetails.lastName}
                    </h3>
                    <p className="text-sm text-gray-500">{userDetails.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      userDetails.role === 'admin'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {userDetails.role}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      userDetails.isActive !== false
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {userDetails.isActive !== false ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            <div className="px-6 py-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-900">Member Since</p>
                  <p className="text-sm text-gray-500">
                    {formatDate(userDetails.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Total Orders</p>
                  <p className="text-sm text-gray-500">{orders.length}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Last Login</p>
                  <p className="text-sm text-gray-500">
                    {userDetails.lastLogin
                      ? formatDate(userDetails.lastLogin)
                      : 'Never'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Recent Orders */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-white rounded-lg shadow overflow-hidden"
          >
            <div className="px-6 py-5 border-b border-gray-200">
              <div className="flex items-center">
                <FiShoppingBag className="h-5 w-5 text-gray-400 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Recent Orders</h3>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.length > 0 ? (
                    orders.slice(0, 5).map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                          <Link href={`/admin/orders/${order._id}`}>
                            {order.orderNumber}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(order.totalPrice)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                        No orders found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Addresses */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-white rounded-lg shadow overflow-hidden"
          >
            <div className="px-6 py-5 border-b border-gray-200">
              <div className="flex items-center">
                <FiMapPin className="h-5 w-5 text-gray-400 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Addresses</h3>
              </div>
            </div>
            <div className="px-6 py-5">
              {userDetails.addresses && userDetails.addresses.length > 0 ? (
                <div className="space-y-4">
                  {userDetails.addresses.map((address, index) => (
                    <div key={index} className="border border-gray-200 rounded-md p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900">
                          {address.type}
                        </span>
                        {address.isDefault && (
                          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                            Default
                          </span>
                        )}
                      </div>
                      <address className="text-sm text-gray-600 not-italic">
                        {address.street}
                        <br />
                        {address.city}, {address.state} {address.zipCode}
                        <br />
                        {address.country}
                      </address>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No addresses on file</p>
              )}
            </div>
          </motion.div>
        </div>
      ) : (
        <div className="bg-gray-50 p-4 rounded-md text-gray-700">
          User not found.
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminUserDetailClient;