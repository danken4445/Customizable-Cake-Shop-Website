import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { NextUIProvider } from "@nextui-org/react";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { ShopProvider } from "./context/ShopContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Welcome from "./pages/Welcome";
import Landing from "./pages/Landing";
import CakeDetails from "./pages/CakeDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import AdminDashboard from "./pages/AdminDashboard";
import Onboarding from "./pages/Onboarding";
import OrderTracking from "./pages/OrderTracking";
import AdminLogin from "./pages/AdminLogin";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import AdminShops from "./pages/AdminShops";

function App() {
  return (
    <NextUIProvider>
      <Router>
        <AuthProvider>
          <ShopProvider>
            <CartProvider>
              <div className="min-h-screen">
                <Navbar />
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Navigate to="/admin/login" replace />} />
                  <Route path="/admin/login" element={<AdminLogin />} />

                  {/* Protected Admin Routes (Super Admin & Admin) */}
                  <Route
                    path="/admin/dashboard"
                    element={
                      <ProtectedRoute requiredRole="superAdmin">
                        <SuperAdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/my-shops"
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <AdminShops />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/onboarding"
                    element={
                      <ProtectedRoute requiredRole="superAdmin">
                        <Onboarding />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/dashboard/:shopId"
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />

                  {/* Multi-tenant Shop Routes (Public) */}
                  <Route path="/shop/:shopId" element={<Landing />} />
                  <Route
                    path="/shop/:shopId/cake/:cakeId"
                    element={<CakeDetails />}
                  />
                  <Route path="/shop/:shopId/cart" element={<Cart />} />
                  <Route path="/shop/:shopId/checkout" element={<Checkout />} />
                  <Route
                    path="/shop/:shopId/track/:orderId"
                    element={<OrderTracking />}
                  />

                  {/* Redirect old routes */}
                  <Route path="/super-admin/login" element={<Navigate to="/admin/login" replace />} />
                  <Route path="/super-admin/dashboard" element={<Navigate to="/admin/dashboard" replace />} />
                </Routes>
              </div>
            </CartProvider>
          </ShopProvider>
        </AuthProvider>
      </Router>
    </NextUIProvider>
  );
}

export default App;
