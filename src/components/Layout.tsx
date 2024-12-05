import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from './Navbar';
import MobileNav from './MobileNav';

const Layout: React.FC = () => {
  const { currentUser, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 mb-4">
            Loading...
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen overflow-hidden">
        {/* Desktop Navigation - Fixed on the left */}
        <div className="hidden md:flex w-64 flex-shrink-0">
          <div className="w-64 flex flex-col fixed h-full">
            <Navbar />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <main className="flex-1">
            <div className="container mx-auto px-4 py-8">
              <Outlet />
            </div>
          </main>

          {/* Mobile Navigation - Fixed at bottom on mobile */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t">
            <MobileNav />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
