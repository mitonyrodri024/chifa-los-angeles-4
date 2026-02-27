'use client';

import ProtectedAdmin from '@/components/shared/ProtectedAdmin';
import AdminPanel from '@/components/admin/AdminPanel';
import { useAuthContext } from '@/lib/contexts/AuthContext';

export default function AdminDashboardPage() {
  const { user } = useAuthContext();

  return (
    <ProtectedAdmin>
      <AdminPanel />
    </ProtectedAdmin>
  );
}