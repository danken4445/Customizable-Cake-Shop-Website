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
  Textarea,
  DatePicker,
  TimeInput,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Chip,
  Divider,
} from "@nextui-org/react";
import { today, getLocalTimeZone } from "@internationalized/date";

export default function Checkout() {
  const navigate = useNavigate();
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const { shopId } = useShop();

  const [customerName, setCustomerName] = useState("");
  const [contact, setContact] = useState("");
  const [address, setAddress] = useState("");
  const [isPickup, setIsPickup] = useState(false);
  const [preferredDate, setPreferredDate] = useState(null);
  const [preferredTime, setPreferredTime] = useState(null);
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdOrders, setCreatedOrders] = useState([]);
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [submittedOrderData, setSubmittedOrderData] = useState(null);

  const handleSubmitOrder = async () => {
    if (!customerName || !contact || (!isPickup && !address) || !preferredDate) {
      alert("Please fill in all required fields including preferred date");
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
          cakeName: item.cakeName,
          selectedBase: item.base,
          selectedSize: item.size,
          placedToppings: item.toppings.map((name, idx) => ({
            id: idx,
            name,
          })),
          totalPrice: item.totalPrice,
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
          const docRef = await addDoc(ordersCollection, {
            customerName,
            customerEmail: contact.includes("@") ? contact : "",
            customerPhone: contact,
            deliveryAddress: isPickup ? "" : address,
            isPickup,
            // Customer's preferred delivery/pickup date (what they want)
            preferredDate: preferredDate ? `${preferredDate.month}/${preferredDate.day}/${preferredDate.year}` : null,
            preferredTime: preferredTime ? `${preferredTime.hour.toString().padStart(2, '0')}:${preferredTime.minute.toString().padStart(2, '0')}` : null,
            // When they want it vs when they ordered it (different dates)
            requestedDeliveryDate: preferredDate ? `${preferredDate.month}/${preferredDate.day}/${preferredDate.year}` : null,
            requestedDeliveryTime: preferredTime ? `${preferredTime.hour.toString().padStart(2, '0')}:${preferredTime.minute.toString().padStart(2, '0')}` : null,
            specialInstructions,
            items: orderData.items,
            totalAmount: orderData.items.reduce(
              (sum, item) => sum + item.totalPrice,
              0
            ),
            status: "pending-approval",
            requestType: "customer-request",
            // When the order was actually placed (system timestamp)
            orderDate: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
          return { shopId, orderId: docRef.id };
        }
      );

      const orders = await Promise.all(orderPromises);
      
      // Store order data before clearing cart
      const orderSummary = {
        customerName,
        contact,
        address,
        isPickup,
        preferredDate,
        preferredTime,
        specialInstructions,
        items: [...cartItems], // Preserve cart items
        totalAmount: getTotalPrice(),
        ordersByShop
      };
      
      // Store orders and show success modal
      setCreatedOrders(orders);
      setSubmittedOrderData(orderSummary);
      setOrderSubmitted(true);
      setShowSuccessModal(true);
      clearCart();
    } catch (error) {
      console.error("Error submitting order:", error);
      alert("Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyTrackingURL = (url) => {
    navigator.clipboard.writeText(url).then(() => {
      // You could add a toast notification here
      alert("Tracking URL copied to clipboard! 📋");
    }).catch(() => {
      alert("Failed to copy URL. Please manually copy it from the text above.");
    });
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    // Navigate to tracking page for first order or home
    if (createdOrders.length > 0) {
      const { shopId, orderId } = createdOrders[0];
      navigate(`/shop/${shopId}/track/${orderId}`);
    } else {
      navigate(getRoutePath("/", shopId));
    }
  };

  // Show order success page if order was just submitted
  if (cartItems.length === 0 && orderSubmitted && submittedOrderData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="text-8xl mb-4">🎉</div>
            <h1 className="text-5xl font-bold text-green-700 mb-4">Order Request Submitted!</h1>
            <p className="text-xl text-green-600 mb-2">Thank you, {submittedOrderData.customerName}!</p>
            <p className="text-lg text-gray-600">Your cake order is now pending baker approval</p>
          </div>

          {/* Order Summary Card */}
          <Card className="mb-8 shadow-2xl border border-green-200">
            <CardBody className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Order Details */}
                <div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-800">📋 Order Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Items:</span>
                      <span className="font-bold text-lg">{submittedOrderData.items.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Estimated Total:</span>
                      <span className="font-bold text-2xl text-green-600">₱{submittedOrderData.totalAmount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Order Placed:</span>
                      <span className="font-medium">{new Date().toLocaleDateString()}</span>
                    </div>
                    {submittedOrderData.preferredDate && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Requested {submittedOrderData.isPickup ? 'Pickup' : 'Delivery'} Date:</span>
                        <span className="font-medium text-blue-600">{`${submittedOrderData.preferredDate.month}/${submittedOrderData.preferredDate.day}/${submittedOrderData.preferredDate.year}`}</span>
                      </div>
                    )}
                    {submittedOrderData.preferredTime && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Requested Time:</span>
                        <span className="font-medium text-blue-600">{`${submittedOrderData.preferredTime.hour.toString().padStart(2, '0')}:${submittedOrderData.preferredTime.minute.toString().padStart(2, '0')}`}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Service Type:</span>
                      <span className="font-medium">{submittedOrderData.isPickup ? "🏪 Store Pickup" : "🚚 Delivery"}</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-gray-600">Contact:</span>
                      <span className="font-medium text-right">{submittedOrderData.contact}</span>
                    </div>
                  </div>
                </div>

                {/* Status Information */}
                <div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-800">📞 What's Next?</h3>
                  <div className="space-y-4">
                    <Chip color="primary" variant="shadow" size="lg" className="mb-4">
                      📋 Pending Approval
                    </Chip>
                    
                    {/* Delivery Schedule Highlight */}
                    {submittedOrderData.preferredDate && (
                      <Card className="bg-blue-50 border border-blue-200 p-4">
                        <div className="text-center">
                          <p className="text-sm text-blue-600 mb-1">You requested:</p>
                          <p className="font-bold text-lg text-blue-800">
                            {submittedOrderData.isPickup ? '🏪 Pickup' : '🚚 Delivery'} on {`${submittedOrderData.preferredDate.month}/${submittedOrderData.preferredDate.day}/${submittedOrderData.preferredDate.year}`}
                          </p>
                          {submittedOrderData.preferredTime && (
                            <p className="text-blue-700">
                              at {`${submittedOrderData.preferredTime.hour.toString().padStart(2, '0')}:${submittedOrderData.preferredTime.minute.toString().padStart(2, '0')}`}
                            </p>
                          )}
                          <p className="text-xs text-blue-600 mt-2">
                            *Baker will confirm availability for this date/time
                          </p>
                        </div>
                      </Card>
                    )}
                    <div className="space-y-3 text-sm text-gray-700">
                      <div className="flex items-start gap-3">
                        <span className="text-blue-500 text-lg">1️⃣</span>
                        <p><strong>Baker Review:</strong> Your order details will be reviewed within 24 hours</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-blue-500 text-lg">2️⃣</span>
                        <p><strong>Confirmation Call:</strong> We'll contact you to confirm details and pricing</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-blue-500 text-lg">3️⃣</span>
                        <p><strong>Production:</strong> Your cake will be prepared with love and care</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-blue-500 text-lg">4️⃣</span>
                        <p><strong>Ready for {submittedOrderData.isPickup ? 'Pickup' : 'Delivery'}:</strong> We'll notify you when it's ready!</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Order Items */}
          <Card className="mb-8 shadow-xl">
            <CardBody className="p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-800">🍰 Your Order Items</h3>
              <div className="space-y-4">
                {submittedOrderData.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border">
                    <div>
                      <p className="font-semibold text-lg">{item.cakeName}</p>
                      <p className="text-gray-600">{item.size}</p>
                      {item.toppings && item.toppings.length > 0 && (
                        <p className="text-sm text-gray-500">
                          Toppings: {item.toppings.join(', ')}
                        </p>
                      )}
                    </div>
                    <Chip color="success" variant="flat" size="lg">
                      ₱{item.totalPrice}
                    </Chip>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Order Tracking */}
          {createdOrders.length > 0 && (
            <Card className="mb-8 shadow-xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200">
              <CardBody className="p-6">
                <h3 className="text-xl font-bold mb-4 text-purple-800">🔍 Track Your Orders</h3>
                <p className="text-purple-700 mb-4">Save these tracking links for order updates:</p>
                
                {createdOrders.map(({ shopId, orderId }, index) => {
                  const trackingURL = `${window.location.origin}/shop/${shopId}/track/${orderId}`;
                  return (
                    <div key={index} className="mb-4 p-4 bg-white rounded-lg border border-purple-200">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-medium">Order #{index + 1}</p>
                          <p className="text-xs text-gray-500 font-mono">ID: {orderId}</p>
                        </div>
                        <Chip size="sm" color="success" variant="flat">Active</Chip>
                      </div>
                      
                      <div className="bg-gray-50 rounded p-3 mb-3">
                        <p className="text-xs text-gray-600 mb-2">Tracking URL:</p>
                        <p className="text-sm font-mono text-gray-800 break-all">{trackingURL}</p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          color="primary"
                          variant="bordered"
                          onPress={() => copyTrackingURL(trackingURL)}
                          className="flex-1"
                        >
                          📋 Copy URL
                        </Button>
                        <Button
                          size="sm"
                          color="secondary"
                          variant="flat"
                          onPress={() => window.open(trackingURL, '_blank')}
                          className="flex-1"
                        >
                          🔗 Track Order
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </CardBody>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="text-center space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                color="primary"
                size="lg"
                onClick={() => navigate(getRoutePath("/", shopId))}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold px-8"
              >
                🛒 Continue Shopping
              </Button>
              {createdOrders.length > 0 && (
                <Button
                  color="secondary"
                  size="lg"
                  variant="bordered"
                  onClick={() => {
                    const { shopId, orderId } = createdOrders[0];
                    navigate(`/shop/${shopId}/track/${orderId}`);
                  }}
                  className="font-semibold px-8"
                >
                  📱 Track My Order
                </Button>
              )}
            </div>
            <p className="text-sm text-gray-500 max-w-2xl mx-auto">
              Questions about your order? Contact the shop directly or use the tracking links above for real-time updates.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show empty cart page if cart is empty and no recent order
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-6xl mb-6">🛒</div>
          <h1 className="text-4xl font-bold mb-4">Checkout</h1>
          <p className="text-xl text-gray-600 mb-8">Your cart is empty</p>
          <p className="text-gray-500 mb-8">Add some delicious cakes to get started!</p>
          <Button
            color="primary"
            size="lg"
            onClick={() => navigate(getRoutePath("/", shopId))}
            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold px-8"
          >
            🍰 Browse Cakes
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Order Request 📋</h1>
          <p className="text-lg text-gray-600">
            Submit your order details for baker review and approval
          </p>
        </div>

        <Card className="shadow-2xl border border-pink-200">
          <CardBody className="gap-8 p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">📞 Contact Information</h2>
              <p className="text-gray-600">We'll use this information to confirm your order</p>
            </div>

            <Input
              label="Full Name"
              placeholder="Enter your full name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
              isRequired
              variant="bordered"
              size="lg"
              startContent={<span className="text-gray-400">👤</span>}
              classNames={{
                input: "text-lg",
                inputWrapper: "h-14"
              }}
            />

            <Input
              label="Contact Number"
              placeholder="09XX XXX XXXX or email@example.com"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              required
              isRequired
              variant="bordered"
              size="lg"
              startContent={<span className="text-gray-400">📱</span>}
              description="Phone number or email address for order updates"
              classNames={{
                input: "text-lg",
                inputWrapper: "h-14"
              }}
            />

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">🚚 Delivery Option</h3>
              <Card className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${isPickup ? "border-2 border-primary bg-primary-50" : "border border-gray-200"}`}
                    isPressable 
                    onPress={() => setIsPickup(!isPickup)}>
                <CardBody className="p-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{isPickup ? "🏪" : "🚚"}</span>
                      <div>
                        <p className="font-semibold">{isPickup ? "Store Pickup" : "Delivery"}</p>
                        <p className="text-sm text-gray-600">
                          {isPickup ? "Pick up from our shop location" : "Deliver to your address"}
                        </p>
                      </div>
                    </div>
                    <Checkbox isSelected={isPickup} onValueChange={setIsPickup} />
                  </div>
                </CardBody>
              </Card>

              {!isPickup && (
                <Input
                  label="Delivery Address"
                  placeholder="Enter your complete delivery address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  isRequired
                  variant="bordered"
                  size="lg"
                  startContent={<span className="text-gray-400">📍</span>}
                  description="Include landmarks or special delivery instructions"
                  classNames={{
                    input: "text-lg",
                    inputWrapper: "h-14"
                  }}
                />
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">📅 Schedule Your Order</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DatePicker
                  label="Preferred Date"
                  placeholder="Select preferred date"
                  value={preferredDate}
                  onChange={setPreferredDate}
                  minValue={today(getLocalTimeZone())}
                  isRequired
                  variant="bordered"
                  size="lg"
                  description="When would you like to receive/pickup your order?"
                />
                <TimeInput
                  label="Preferred Time"
                  placeholder="Select preferred time"
                  value={preferredTime}
                  onChange={setPreferredTime}
                  variant="bordered"
                  size="lg"
                  description="Optional preferred time"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">📝 Special Instructions</h3>
              <Textarea
                label="Notes for the Baker"
                placeholder="Share any special requests, dietary requirements, design preferences, or important details about your order..."
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                minRows={4}
                maxRows={8}
                variant="bordered"
                description="Optional: Help us make your cake perfect by sharing any special requirements"
                classNames={{
                  input: "text-base"
                }}
              />
              <div className="flex flex-wrap gap-2">
                <Chip size="sm" variant="flat" color="secondary">💡 Design ideas</Chip>
                <Chip size="sm" variant="flat" color="secondary">🥜 Allergies</Chip>
                <Chip size="sm" variant="flat" color="secondary">🎂 Occasion details</Chip>
                <Chip size="sm" variant="flat" color="secondary">📏 Size preferences</Chip>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-200">
              <h3 className="font-semibold mb-3 text-lg">📋 Order Request Summary</h3>
              <div className="space-y-2 text-sm">
                <p className="flex justify-between">
                  <span className="text-gray-600">Items:</span>
                  <span className="font-medium">{cartItems.length} item(s) from {new Set(cartItems.map((item) => item.shopName)).size} shop(s)</span>
                </p>
                {preferredDate && (
                  <p className="flex justify-between">
                    <span className="text-gray-600">Preferred Date:</span>
                    <span className="font-medium">{`${preferredDate.month}/${preferredDate.day}/${preferredDate.year}`}</span>
                  </p>
                )}
                {preferredTime && (
                  <p className="flex justify-between">
                    <span className="text-gray-600">Preferred Time:</span>
                    <span className="font-medium">{`${preferredTime.hour.toString().padStart(2, '0')}:${preferredTime.minute.toString().padStart(2, '0')}`}</span>
                  </p>
                )}
                <p className="flex justify-between">
                  <span className="text-gray-600">Service Type:</span>
                  <span className="font-medium">{isPickup ? "🏪 Pickup" : "🚚 Delivery"}</span>
                </p>
              </div>
              <div className="border-t border-blue-300 mt-4 pt-3">
                <p className="text-2xl font-bold text-blue-700 flex justify-between">
                  <span>Estimated Total:</span>
                  <span>₱{getTotalPrice()}</span>
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  *Final amount subject to baker confirmation
                </p>
              </div>
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
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Spinner size="sm" color="white" />
                    <span>Submitting...</span>
                  </div>
                ) : "📋 Submit Order Request"}
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Success Modal */}
      <Modal 
        isOpen={showSuccessModal} 
        onClose={handleModalClose}
        size="2xl"
        scrollBehavior="inside"
        classNames={{
          base: "bg-gradient-to-br from-green-50 to-blue-50",
          header: "border-b border-green-200",
          footer: "border-t border-green-200",
        }}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-2 text-center">
            <div className="text-6xl mb-2">🎉</div>
            <h3 className="text-2xl font-bold text-green-700">Order Request Submitted Successfully!</h3>
            <p className="text-green-600 font-normal">Your cake order is now pending baker approval</p>
          </ModalHeader>
          
          <ModalBody>
            <div className="space-y-6">
              {/* Status Information */}
              <Card className="bg-blue-50 border border-blue-200">
                <CardBody className="text-center p-6">
                  <Chip color="primary" variant="shadow" size="lg" className="mb-3">
                    📋 Pending Approval
                  </Chip>
                  <p className="text-blue-700 font-medium mb-2">
                    What happens next?
                  </p>
                  <div className="text-sm text-blue-600 space-y-1">
                    <p>• Baker will review your order details</p>
                    <p>• You'll be contacted for confirmation</p>
                    <p>• Final pricing may be adjusted</p>
                    <p>• Delivery/pickup arrangements will be confirmed</p>
                  </div>
                </CardBody>
              </Card>

              {/* Order Details */}
              <Card>
                <CardBody>
                  <h4 className="font-semibold mb-3">📦 Order Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Items:</span>
                      <span className="font-medium">{submittedOrderData?.items.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Estimated Total:</span>
                      <span className="font-medium text-green-600">₱{submittedOrderData?.totalAmount || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Order Date:</span>
                      <span className="font-medium">{new Date().toLocaleDateString()}</span>
                    </div>
                    {submittedOrderData?.preferredDate && (
                      <div className="flex justify-between">
                        <span>Requested {submittedOrderData?.isPickup ? 'Pickup' : 'Delivery'}:</span>
                        <span className="font-medium text-blue-600">{`${submittedOrderData.preferredDate.month}/${submittedOrderData.preferredDate.day}/${submittedOrderData.preferredDate.year}`}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Service Type:</span>
                      <span className="font-medium">{submittedOrderData?.isPickup ? "🏪 Pickup" : "🚚 Delivery"}</span>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Tracking Information */}
              <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200">
                <CardBody>
                  <h4 className="font-semibold mb-3 text-purple-800">🔍 Track Your Orders</h4>
                  <p className="text-sm text-purple-700 mb-4">
                    Save these links to track your order status and updates:
                  </p>
                  
                  {createdOrders.map(({ shopId, orderId }, index) => {
                    const trackingURL = `${window.location.origin}/shop/${shopId}/track/${orderId}`;
                    return (
                      <div key={index} className="mb-4 p-4 bg-white rounded-lg border border-purple-200">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium text-sm">Order #{index + 1}</p>
                            <p className="text-xs text-gray-500">ID: {orderId}</p>
                          </div>
                          <Chip size="sm" color="success" variant="flat">
                            Active
                          </Chip>
                        </div>
                        
                        <div className="bg-gray-50 rounded p-3 mb-3">
                          <p className="text-xs text-gray-600 mb-2">Tracking URL:</p>
                          <p className="text-sm font-mono text-gray-800 break-all">
                            {trackingURL}
                          </p>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            color="primary"
                            variant="bordered"
                            onPress={() => copyTrackingURL(trackingURL)}
                            className="flex-1"
                          >
                            📋 Copy URL
                          </Button>
                          <Button
                            size="sm"
                            color="secondary"
                            variant="flat"
                            onPress={() => window.open(trackingURL, '_blank')}
                            className="flex-1"
                          >
                            🔗 Open Link
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </CardBody>
              </Card>

              {/* Contact Information */}
              <Card className="bg-yellow-50 border border-yellow-200">
                <CardBody>
                  <h4 className="font-semibold mb-2 text-yellow-800">📞 Need Help?</h4>
                  <p className="text-sm text-yellow-700 mb-3">
                    If you have any questions or need to modify your order, please contact the shop directly.
                  </p>
                  <div className="text-xs text-yellow-600">
                    <p>• Response time: Usually within 24 hours</p>
                    <p>• Order modifications: Contact before approval</p>
                    <p>• Cancellations: Available before preparation starts</p>
                  </div>
                </CardBody>
              </Card>
            </div>
          </ModalBody>

          <ModalFooter className="justify-center">
            <Button
              color="primary"
              size="lg"
              onPress={handleModalClose}
              className="bg-gradient-to-r from-green-500 to-blue-600 text-white font-semibold px-8"
            >
              🎂 Continue to Order Tracking
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
