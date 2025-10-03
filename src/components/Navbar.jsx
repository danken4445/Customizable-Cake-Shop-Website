import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Button,
  Badge,
} from "@nextui-org/react";
import { Link, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useShop } from "../context/ShopContext";
import { getRoutePath } from "../utils/shopUtils";

export default function NavigationBar() {
  const location = useLocation();
  const { cartItems } = useCart();
  const { shop, shopId } = useShop();
  const totalItems = cartItems.reduce(
    (sum, item) => sum + (item.quantity || 1),
    0
  );

  return (
    <Navbar isBordered className="bg-gradient-to-r from-pink-500 to-purple-600">
      <NavbarBrand>
        <Link
          to={getRoutePath("/", shopId)}
          className="font-bold text-white text-xl"
        >
          🎂 {shop?.name || "CakeShop"}
        </Link>
      </NavbarBrand>

      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        <NavbarItem
          isActive={
            location.pathname === "/" || location.pathname === `/${shopId}`
          }
        >
          <Link
            to={getRoutePath("/", shopId)}
            className="text-white hover:text-pink-200"
          >
            Home
          </Link>
        </NavbarItem>
      </NavbarContent>

      <NavbarContent justify="end">
        <NavbarItem>
          <Badge
            content={totalItems}
            color="danger"
            isInvisible={totalItems === 0}
            shape="circle"
          >
            <Button
              as={Link}
              to={getRoutePath("/cart", shopId)}
              color="warning"
              variant="flat"
              size="sm"
            >
              🛒 Cart
            </Button>
          </Badge>
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
}
