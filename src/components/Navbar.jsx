import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Button,
  Badge,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useShop } from "../context/ShopContext";
import { useAuth } from "../context/AuthContext";
import { getRoutePath } from "../utils/shopUtils";

export default function NavigationBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { cartItems } = useCart();
  const { shop, shopId } = useShop();
  const { user, userRole, isAuthenticated, signOut } = useAuth();
  const totalItems = cartItems.reduce(
    (sum, item) => sum + (item.quantity || 1),
    0
  );

  // Check if we're on a shop page
  const isShopPage = location.pathname.startsWith("/shop/");
  const isAdminPage = location.pathname.startsWith("/admin") || location.pathname.startsWith("/onboarding");

  const handleLogout = async () => {
    await signOut();
    navigate('/admin/login');
  };

  return (
    <Navbar isBordered className="bg-gradient-to-r from-pink-500 to-purple-600">
      <NavbarBrand>
        {isShopPage && shopId ? (
          <Link
            to={getRoutePath("", shopId)}
            className="font-bold text-white text-xl"
          >
            🎂 {shop?.name || "CakeShop"}
          </Link>
        ) : isAuthenticated ? (
          <div className="font-bold text-white text-xl cursor-pointer" onClick={() => navigate(userRole === 'superAdmin' ? '/admin/dashboard' : '/admin/my-shops')}>
            🎂 {userRole === 'superAdmin' ? 'Super Admin' : 'Admin Panel'}
          </div>
        ) : (
          <div className="font-bold text-white text-xl">
            🎂 Multi-Shop Platform
          </div>
        )}
      </NavbarBrand>

      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        {isShopPage && shopId && (
          <NavbarItem
            isActive={location.pathname === `/shop/${shopId}`}
          >
            <Link
              to={getRoutePath("", shopId)}
              className="text-white hover:text-pink-200"
            >
              Shop Home
            </Link>
          </NavbarItem>
        )}
        
        {isAdminPage && isAuthenticated && (
          <>
            {userRole === 'superAdmin' && (
              <>
                <NavbarItem isActive={location.pathname === "/admin/dashboard"}>
                  <Link to="/admin/dashboard" className="text-white hover:text-pink-200">
                    Dashboard
                  </Link>
                </NavbarItem>
                <NavbarItem isActive={location.pathname === "/onboarding"}>
                  <Link to="/onboarding" className="text-white hover:text-pink-200">
                    Create Shop
                  </Link>
                </NavbarItem>
              </>
            )}
            {userRole === 'admin' && (
              <NavbarItem isActive={location.pathname === "/admin/my-shops"}>
                <Link to="/admin/my-shops" className="text-white hover:text-pink-200">
                  My Shops
                </Link>
              </NavbarItem>
            )}
          </>
        )}
      </NavbarContent>

      <NavbarContent justify="end">
        {isShopPage && shopId && (
          <NavbarItem>
            <Badge
              content={totalItems}
              color="danger"
              isInvisible={totalItems === 0}
              shape="circle"
            >
              <Button
                as={Link}
                to={getRoutePath("cart", shopId)}
                color="warning"
                variant="flat"
                size="sm"
              >
                🛒 Cart
              </Button>
            </Badge>
          </NavbarItem>
        )}
        
        {isAuthenticated ? (
          <NavbarItem>
            <Dropdown>
              <DropdownTrigger>
                <Button 
                  color="default" 
                  variant="light"
                  className="text-white"
                  size="sm"
                >
                  👤 {user?.email}
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="User menu">
                {userRole === 'superAdmin' && (
                  <>
                    <DropdownItem 
                      key="dashboard"
                      onClick={() => navigate("/admin/dashboard")}
                    >
                      Dashboard
                    </DropdownItem>
                    <DropdownItem 
                      key="create-shop"
                      onClick={() => navigate("/onboarding")}
                    >
                      Create Shop
                    </DropdownItem>
                  </>
                )}
                {userRole === 'admin' && (
                  <>
                    <DropdownItem 
                      key="my-shops"
                      onClick={() => navigate("/admin/my-shops")}
                    >
                      My Shops
                    </DropdownItem>
                    <DropdownItem 
                      key="dashboard"
                      onClick={() => navigate("/admin/my-shops")}
                    >
                      Dashboard
                    </DropdownItem>
                  </>
                )}
                <DropdownItem 
                  key="logout"
                  onClick={handleLogout}
                  className="text-danger"
                  color="danger"
                >
                  Logout
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </NavbarItem>
        ) : (
          !isShopPage && (
            <NavbarItem>
              <Button 
                color="default" 
                variant="light"
                className="text-white"
                size="sm"
                onPress={() => navigate("/admin/login")}
              >
                🔐 Admin Login
              </Button>
            </NavbarItem>
          )
        )}
      </NavbarContent>
    </Navbar>
  );
}
