"use client";

import { useState } from 'react';
import AdminDashboard from '@/components/admin/AdminDashboard';
import LoginModal from '@/components/admin/LoginModal';

export type AccessLevel = 'admin' | 'viewer';

export default function AdminPage() {
  const [accessLevel, setAccessLevel] = useState<AccessLevel | null>(null);

  const handleLoginSuccess = (level: AccessLevel) => {
    setAccessLevel(level);
  };

  return (
    <>
      <div className="min-h-screen bg-background">
        {accessLevel ? (
          <AdminDashboard accessLevel={accessLevel} />
        ) : (
          <LoginModal onLoginSuccess={handleLoginSuccess} />
        )}
      </div>
    </>
  );
}
