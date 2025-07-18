import React from 'react';
import AdminUserDetailClient from './AdminUserDetailClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminUserDetailPage({ params }: PageProps) {
  const { id } = await params;
  
  return <AdminUserDetailClient userId={id} />;
}