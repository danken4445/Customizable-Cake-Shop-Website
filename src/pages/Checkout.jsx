import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useShop } from "../context/ShopContext";
import { getRoutePath } from "../utils/shopUtils";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import {
  Button,
  Card,
  CardBody,
  Input,
  Checkbox,
  Spinner,
} from "@nextui-org/react";

export default function Checkout() {
  const navigate = useNavigate();
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const { shopId } = useShop();

  const [customerName, setCustomerName] = useState("");
  const [contact, setContact] = useState("");
  const [address, setAddress] = useState("");
  const [isPickup, setIsPickup] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmitOrder = async () => {
    if (!customerName || !contact || (!isPickup && !address)) {
      alert("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      // Group items by shop
      const ordersByShop = {};
      cartItems.forEach((item) => {
        if (!ordersByShop[item.shopId]) {
          ordersByShop[item.shopId] = {
            shopName: item.shopName,
            items: [],
          };
        }
        ordersByShop[item.shopId].items.push({
          cake: item.cakeName,
          base: item.base,
          size: item.size,
          toppings: item.toppings,
          price: item.totalPrice,
        });
      });

      // Create orders for each shop
      const orderPromises = Object.entries(ordersByShop).map(
        async ([shopId, orderData]) => {
          const ordersCollection = collection(
            db,
            "cakeShops",
            shopId,
            "orders"
          );
          return await addDoc(ordersCollection, {
            customerName,
            contact,
            address: isPickup ? "Pickup" : address,
            pickup: isPickup,
            items: orderData.items,
            totalPrice: orderData.items.reduce(
              (sum, item) => sum + item.price,
              0
            ),
            status: "pending",
            createdAt: new Date().toISOString(),
          });
        }
      );

      await Promise.all(orderPromises);

      alert("Order placed successfully! 🎉");
      clearCart();
      navigate(getRoutePath("/", shopId));
    } catch (error) {
      console.error("Error submitting order:", error);
      alert("Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-6">Checkout</h1>
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
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Checkout 🛍️</h1>

        <Card>
          <CardBody className="gap-6">
            <h2 className="text-2xl font-bold">Delivery Information</h2>

            <Input
              label="Full Name"
              placeholder="Enter your name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
              isRequired
            />

            <Input
              label="Contact Number"
              placeholder="09XX XXX XXXX"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              required
              isRequired
            />

            <Checkbox isSelected={isPickup} onValueChange={setIsPickup}>
              Pickup (No delivery address needed)
            </Checkbox>

            {!isPickup && (
              <Input
                label="Delivery Address"
                placeholder="Enter your complete address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                isRequired
              />
            )}

            <div className="bg-gray-100 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Order Summary</h3>
              <p className="text-sm text-gray-600 mb-2">
                {cartItems.length} item(s) from{" "}
                {new Set(cartItems.map((item) => item.shopName)).size} shop(s)
              </p>
              <p className="text-2xl font-bold text-green-600">
                Total: ₱{getTotalPrice()}
              </p>
            </div>

            <div className="flex gap-4">
              <Button
                color="default"
                variant="bordered"
                className="flex-1"
                onClick={() => navigate(getRoutePath("/cart", shopId))}
                disabled={loading}
              >
                Back to Cart
              </Button>
              <Button
                color="primary"
                className="flex-1"
                size="lg"
                onClick={handleSubmitOrder}
                disabled={loading}
              >
                {loading ? <Spinner size="sm" color="white" /> : "Place Order"}
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
