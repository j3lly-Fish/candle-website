'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { FiArrowLeft, FiUser, FiShoppingBag, FiMapPin, FiEdit, FiUserCheck, FiUserX } from 'react-icons/fi';
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
  active: boolean;
  addresses: Address[];
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

const AdminUserDetail = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState<'activate' | 'deactivate' | 'makeAdmin' | 'removeAdmin' | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);

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
  }, [user, loading, router]);

  const fetchUserDetails = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/admin/users/${params.id}`, {
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
      setOrders(data.data.orders);
      setError(null);
    } catch (err) {
      setError('Error loading user details. Please try again.');
      console.error('User details fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!userDetails) return;
    
    try {
      setIsUpdating(true);
      setUpdateSuccess(null);
      
      let updateData: any = {};
      
      if (modalAction === 'activate' || modalAction === 'deactivate') {
        updateData.active = modalAction === 'activate';
      } else if (modalAction === 'makeAdmin' || modalAction === 'removeAdmin') {
        updateData.role = modalAction === 'makeAdmin' ? 'admin' : 'customer';
      }
      
      const response = await fetch(`/api/admin/users/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error(`Failed to update user`);
      }

      const data = await response.json();
      setUserDetails(data.data.user);
      
      let successMessage = '';
      switch (modalAction) {
        case 'activate':
          successMessage = 'User activated successfully';
          break;
        case 'deactivate':
          successMessage = 'User deactivated successfully';
          break;
        case 'makeAdmin':
          successMessage = 'User promoted to admin successfully';
          break;
        case 'removeAdmin':
          successMessage = 'Admin privileges removed successfully';
          break;
      }
      
      setUpdateSuccess(successMessage);
      setShowModal(false);
      setModalAction(null);
    } catch (err) {
      console.error('User update error:', err);
      setError(`Failed to update user. Please try again.`);
    } finally {
      setIsUpdating(false);
    }
  };

  const openModal = (action: 'activate' | 'deactivate' | 'makeAdmin' | 'removeAdmin') => {
    setModalAction(action);
    setShowModal(true);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
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
    <AdminLayout title={userDetails ? `${userDetails.firstName} ${userDetails.lastName}` : 'User Details'}>
      <div className="mb-6">
        <Link
          href="/admin/users"
          className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-red-700"
        >
          <FiArrowLeft className="mr-1" /> Back to Users
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-700"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-6 rounded-lg text-red-700">{error}</div>
      ) : userDetails ? (
        <div className="space-y-6">
          {updateSuccess && (
            <div className="bg-green-50 p-4 rounded-md text-green-700 mb-4">
              {updateSuccess}
            </div>
          )}
          
          {/* User Header */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex items-center">
                <div className="bg-gray-100 rounded-full p-3 mr-4">
                  <FiUser className="h-8 w-8 text-gray-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {userDetails.firstName} {userDetails.lastName}
                  </h2>
                  <p className="text-sm text-gray-500">
                    <a href={`mailto:${userDetails.email}`} className="text-blue-600 hover:underline">
                      {userDetails.email}
                    </a>
                  </p>
                </div>
              </div>
              <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
                <span
                  className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${
                    userDetails.role === 'admin'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {userDetails.role.charAt(0).toUpperCase() + userDetails.role.slice(1)}
                </span>
                <span
                  className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${
                    userDetails.active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {userDetails.active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* User Information */}
            <div className="md:col-span-1 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-lg shadow overflow-hidden"
              >
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Account Information</h3>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Member Since</h4>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(userDetails.createdAt)}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Last Login</h4>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(userDetails.lastLogin)}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Last Updated</h4>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(userDetails.updatedAt)}</p>
                  </div>
                </div>
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/admin/users/${userDetails._id}/edit`}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm leading-5 font-medium rounded-md text-gray-700 bg-white hover:text-gray-500 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:text-gray-800 active:bg-gray-50 transition ease-in-out duration-150"
                    >
                      <FiEdit className="mr-1" /> Edit
                    </Link>
                    {userDetails.active ? (
                      <button
                        onClick={() => openModal('deactivate')}
                        className="inline-flex items-center px-3 py-1 border border-red-300 text-sm leading-5 font-medium rounded-md text-red-700 bg-white hover:text-red-500 focus:outline-none focus:border-red-300 focus:shadow-outline-red active:text-red-800 active:bg-red-50 transition ease-in-out duration-150"
                        disabled={userDetails._id === user?._id} // Prevent deactivating self
                        title={userDetails._id === user?._id ? "Can't deactivate yourself" : 'Deactivate user'}
                      >
                        <FiUserX className="mr-1" /> Deactivate
                      </button>
                    ) : (
                      <button
                        onClick={() => openModal('activate')}
                        className="inline-flex items-center px-3 py-1 border border-green-300 text-sm leading-5 font-medium rounded-md text-green-700 bg-white hover:text-green-500 focus:outline-none focus:border-green-300 focus:shadow-outline-green active:text-green-800 active:bg-green-50 transition ease-in-out duration-150"
                      >
                        <FiUserCheck className="mr-1" /> Activate
                      </button>
                    )}
                    {userDetails.role === 'customer' ? (
                      <button
                        onClick={() => openModal('makeAdmin')}
                        className="inline-flex items-center px-3 py-1 border border-purple-300 text-sm leading-5 font-medium rounded-md text-purple-700 bg-white hover:text-purple-500 focus:outline-none focus:border-purple-300 focus:shadow-outline-purple active:text-purple-800 active:bg-purple-50 transition ease-in-out duration-150"
                      >
                        Make Admin
                      </button>
                    ) : (
                      <button
                        onClick={() => openModal('removeAdmin')}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm leading-5 font-medium rounded-md text-gray-700 bg-white hover:text-gray-500 focus:outline-none focus:border-gray-300 focus:shadow-outline-gray active:text-gray-800 active:bg-gray-50 transition ease-in-out duration-150"
                        disabled={userDetails._id === user?._id} // Prevent removing admin from self
                        title={userDetails._id === user?._id ? "Can't remove your own admin role" : 'Remove admin role'}
                      >
                        Remove Admin
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Addresses */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="bg-white rounded-lg shadow overflow-hidden"
              >
                <div className="px-6 py-4 border-b border-gray-200 flex items-center">
                  <FiMapPin className="text-gray-500 mr-2" />
                  <h3 className="text-lg font-medium text-gray-900">Addresses</h3>
                </div>
                <div className="p-6">
                  {userDetails.addresses && userDetails.addresses.length > 0 ? (
                    <div className="space-y-4">
                      {userDetails.addresses.map((address) => (
                        <div key={address._id} className="border border-gray-200 rounded-md p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <span className="font-medium text-gray-900">
                                {address.type.charAt(0).toUpperCase() + address.type.slice(1)}
                              </span>
                              {address.isDefault && (
                                <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                                  Default
                                </span>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-gray-700">
                            {address.street}
                            <br />
                            {address.city}, {address.state} {address.zipCode}
                            <br />
                            {address.country}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No addresses found</p>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Orders */}
            <div className="md:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="bg-white rounded-lg shadow overflow-hidden"
              >
                <div className="px-6 py-4 border-b border-gray-200 flex items-center">
                  <FiShoppingBag className="text-gray-500 mr-2" />
                  <h3 className="text-lg font-medium text-gray-900">Order History</h3>
                </div>
                <div className="overflow-x-auto">
                  {orders && orders.length > 0 ? (
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Order #
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Date
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Total
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Status
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {orders.map((order) => (
                          <tr key={order._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                              <Link href={`/admin/orders/${order._id}`}>{order.orderNumber}</Link>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(order.createdAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatCurrency(order.totalPrice)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                                  order.status
                                )}`}
                              >
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <Link
                                href={`/admin/orders/${order._id}`}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                View
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="p-6 text-center text-sm text-gray-500">
                      No orders found for this user
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 p-6 rounded-lg text-yellow-700">User not found</div>
      )}

      {/* Action Confirmation Modal */}
      {showModal && userDetails && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div
                    className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full sm:mx-0 sm:h-10 sm:w-10 ${
                      modalAction === 'activate' || modalAction === 'makeAdmin'
                        ? 'bg-green-100'
                        : 'bg-red-100'
                    }`}
                  >
                    {modalAction === 'activate' || modalAction === 'makeAdmin' ? (
                      <FiUserCheck className={`h-6 w-6 text-green-600`} />
                    ) : (
                      <FiUserX className={`h-6 w-6 text-red-600`} />
                    )}
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {modalAction === 'activate'
                        ? 'Activate User'
                        : modalAction === 'deactivate'
                        ? 'Deactivate User'
                        : modalAction === 'makeAdmin'
                        ? 'Make User Admin'
                        : 'Remove Admin Role'}
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        {modalAction === 'activate'
                          ? `Are you sure you want to activate ${userDetails.firstName} ${userDetails.lastName}'s account?`
                          : modalAction === 'deactivate'
                          ? `Are you sure you want to deactivate ${userDetails.firstName} ${userDetails.lastName}'s account? They will no longer be able to log in.`
                          : modalAction === 'makeAdmin'
                          ? `Are you sure you want to give ${userDetails.firstName} ${userDetails.lastName} admin privileges? They will have full access to the admin dashboard.`
                          : `Are you sure you want to remove admin privileges from ${userDetails.firstName} ${userDetails.lastName}?`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleUpdateUser}
                  disabled={isUpdating}
                  className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm ${
                    modalAction === 'activate' || modalAction === 'makeAdmin'
                      ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                      : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                  } disabled:opacity-50`}
                >
                  {isUpdating
                    ? 'Processing...'
                    : modalAction === 'activate'
                    ? 'Activate'
                    : modalAction === 'deactivate'
                    ? 'Deactivate'
                    : modalAction === 'makeAdmin'
                    ? 'Make Admin'
                    : 'Remove Admin'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setModalAction(null);
                  }}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminUserDetail;