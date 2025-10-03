import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { NextUIProvider } from "@nextui-org/react";
import { CartProvider } from "./context/CartContext";
import { ShopProvider } from "./context/ShopContext";
import Navbar from "./components/Navbar";
import Landing from "./pages/Landing";
import CustomizeCake from "./pages/CustomizeCake";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <NextUIProvider>
      <ShopProvider>
        <CartProvider>
          <Router>
            <div className="min-h-screen">
              <Navbar />
              <Routes>
                {/* Production routes (subdomain-based) */}
                <Route path="/" element={<Landing />} />
                <Route path="/customize/:cakeId" element={<CustomizeCake />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/admin" element={<AdminDashboard />} />

                {/* Development routes (path-based for testing multiple shops) */}
                <Route path="/:shopId" element={<Landing />} />
                <Route
                  path="/:shopId/customize/:cakeId"
                  element={<CustomizeCake />}
                />
                <Route path="/:shopId/cart" element={<Cart />} />
                <Route path="/:shopId/checkout" element={<Checkout />} />
                <Route path="/:shopId/admin" element={<AdminDashboard />} />
              </Routes>
            </div>
          </Router>
        </CartProvider>
      </ShopProvider>
    </NextUIProvider>
  );
}

export default App;
