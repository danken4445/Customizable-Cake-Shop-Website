import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useShop } from "../context/ShopContext";
import { getRoutePath } from "../utils/shopUtils";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Divider,
} from "@nextui-org/react";

export default function Cart() {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, getTotalPrice } = useCart();
  const { shopId } = useShop();

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-6">Your Cart</h1>
          <p className="text-xl text-gray-600 mb-8">Your cart is empty 🛒</p>
          <Button
            color="primary"
            size="lg"
            onClick={() => navigate(getRoutePath("/", shopId))}
          >
            Back to Shop
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Your Cart 🛒</h1>

        <div className="space-y-4 mb-8">
          {cartItems.map((item, index) => (
            <Card key={item.id || index}>
              <CardHeader className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold">{item.cakeName}</h3>
                  <p className="text-sm text-gray-500">{item.shopName}</p>
                </div>
                <Chip color="success" variant="flat" size="lg">
                  ₱{item.totalPrice}
                </Chip>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                  <div>
                    <strong>Base:</strong> {item.base}
                  </div>
                  <div>
                    <strong>Size:</strong> {item.size}
                  </div>
                  <div className="col-span-2">
                    <strong>Toppings:</strong>{" "}
                    {item.toppings.length > 0
                      ? item.toppings.join(", ")
                      : "None"}
                  </div>
                </div>
                <Button
                  color="danger"
                  variant="light"
                  size="sm"
                  onClick={() => removeFromCart(item.id)}
                >
                  Remove
                </Button>
              </CardBody>
            </Card>
          ))}
        </div>

        <Divider className="my-6" />

        <Card className="bg-gradient-to-r from-purple-100 to-pink-100">
          <CardBody>
            <div className="flex justify-between items-center mb-4">
              <span className="text-2xl font-bold">Total:</span>
              <Chip
                color="success"
                variant="shadow"
                size="lg"
                className="text-2xl font-bold"
              >
                ₱{getTotalPrice()}
              </Chip>
            </div>
            <div className="flex gap-4">
              <Button
                color="default"
                variant="bordered"
                className="flex-1"
                onClick={() => navigate(getRoutePath("/", shopId))}
              >
                Continue Shopping
              </Button>
              <Button
                color="primary"
                className="flex-1"
                size="lg"
                onClick={() => navigate(getRoutePath("/checkout", shopId))}
              >
                Proceed to Checkout
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
