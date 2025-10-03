import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '@nextui-org/react';

export default function ProtectedRoute({ children, requiredRole, shopId }) {
  const { user, userRole, loading, hasAccessToShop } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" label="Loading..." />
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Check role-based access
  if (requiredRole) {
    if (requiredRole === 'superAdmin' && userRole !== 'superAdmin') {
      // Only super admins allowed
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
            <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
            <p className="text-sm text-gray-500">Super Admin access required.</p>
          </div>
        </div>
      );
    }

    if (requiredRole === 'admin' && userRole !== 'admin' && userRole !== 'superAdmin') {
      // Admins or super admins allowed
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
            <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
            <p className="text-sm text-gray-500">Admin access required.</p>
          </div>
        </div>
      );
    }
  }

  // Check shop-specific access (for regular admins)
  if (shopId && !hasAccessToShop(shopId)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">You don't have permission to manage this shop.</p>
          <p className="text-sm text-gray-500">Shop ID: {shopId}</p>
        </div>
      </div>
    );
  }

  return children;
}
