"use client";

import { useState } from 'react';
import AdminDashboard from '@/components/admin/AdminDashboard';
import LoginModal from '@/components/admin/LoginModal';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  return (
    <>
      <div className="min-h-screen bg-background">
        {isAuthenticated ? (
          <AdminDashboard />
        ) : (
          <LoginModal onLoginSuccess={handleLoginSuccess} />
        )}
      </div>
    </>
  );
}
