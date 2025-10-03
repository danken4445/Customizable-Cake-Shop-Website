import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import {
  Card,
  CardBody,
  CardHeader,
  Chip,
  Progress,
  Divider,
  Spinner,
} from "@nextui-org/react";

const ORDER_STATUSES = {
  'pending-approval': { label: "Pending Approval", color: "warning", step: 0 },
  'pending': { label: "Confirmed", color: "primary", step: 1 },
  'baking': { label: "Being Prepared", color: "secondary", step: 2 },
  'completed': { label: "Ready for Pickup/Delivery", color: "success", step: 3 },
  'cancelled': { label: "Cancelled", color: "danger", step: 0 },
};

function OrderTracking() {
  const { shopId, orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderAndShop = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch shop details
        const shopDoc = await getDoc(doc(db, "cakeShops", shopId));
        if (!shopDoc.exists()) {
          setError("Shop not found");
          return;
        }
        setShop(shopDoc.data());

        // Fetch order details
        const orderDoc = await getDoc(
          doc(db, "cakeShops", shopId, "orders", orderId)
        );
        if (!orderDoc.exists()) {
          setError("Order not found");
          return;
        }
        setOrder({ id: orderDoc.id, ...orderDoc.data() });
      } catch (err) {
        console.error("Error fetching order:", err);
        setError("Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    if (shopId && orderId) {
      fetchOrderAndShop();
    }
  }, [shopId, orderId]);

  const getProgressValue = () => {
    if (!order || !order.status) return 0;
    
    // Handle cancelled orders
    if (order.status === 'cancelled') return 0;
    
    const status = ORDER_STATUSES[order.status];
    if (!status) {
      console.warn(`Unknown order status: ${order.status}`);
      return 0;
    }
    
    // Calculate progress: step 3 (completed) is 100%
    const maxStep = 3;
    return Math.min((status.step / maxStep) * 100, 100);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" label="Loading order details..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-xl">
            <CardBody className="text-center py-12">
              <p className="text-2xl text-red-500 font-semibold mb-4">
                ⚠️ {error}
              </p>
              <p className="text-gray-600">
                Please check your order ID and try again.
              </p>
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }

  if (!order) return null;

  const statusInfo = ORDER_STATUSES[order.status] || ORDER_STATUSES.pending;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Shop Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {shop?.name || "Cake Shop"}
          </h1>
          <p className="text-gray-600">Order Tracking</p>
        </div>

        {/* Order Status Card */}
        <Card className="shadow-xl mb-6">
          <CardHeader className="flex flex-col gap-2 px-6 pt-6">
            <div className="flex justify-between items-start w-full">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Order #{orderId.slice(-8).toUpperCase()}
                </h2>
                <div className="text-sm mt-2 space-y-1">
                  <p className="text-gray-600">
                    📅 Placed on{" "}
                    {(order.createdAt || order.orderDate)
                      ? new Date(order.createdAt || order.orderDate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "N/A"}
                  </p>
                  {(order.preferredDate || order.requestedDeliveryDate) && (
                    <p className="text-blue-600 font-medium">
                      🚚 {order.isPickup ? 'Pickup' : 'Delivery'} requested for{" "}
                      <span className="font-bold">{order.preferredDate || order.requestedDeliveryDate}</span>
                      {(order.preferredTime || order.requestedDeliveryTime) && (
                        <span> at {order.preferredTime || order.requestedDeliveryTime}</span>
                      )}
                    </p>
                  )}
                </div>
              </div>
              <Chip color={statusInfo.color} variant="flat" size="lg">
                {statusInfo.label}
              </Chip>
            </div>
          </CardHeader>
          <Divider />
          <CardBody className="px-6 py-6">
            {/* Progress Bar */}
            {order.status !== "cancelled" && (
              <div className="mb-8">
                <Progress
                  value={getProgressValue()}
                  color={statusInfo.color}
                  size="md"
                  className="mb-4"
                />
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Pending Approval</span>
                  <span>Confirmed</span>
                  <span>Being Prepared</span>
                  <span>Ready</span>
                </div>
              </div>
            )}

            {/* Order Items */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Order Items
              </h3>
              {order.items?.map((item, index) => (
                <Card key={index} className="bg-gray-50">
                  <CardBody className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">
                          {item.cakeName || "Custom Cake"}
                        </p>
                        {item.selectedBase && (
                          <p className="text-sm text-gray-600">
                            Base: {item.selectedBase}
                          </p>
                        )}
                        {item.selectedSize && (
                          <p className="text-sm text-gray-600">
                            Size: {item.selectedSize}
                          </p>
                        )}
                        {item.placedToppings &&
                          item.placedToppings.length > 0 && (
                            <p className="text-sm text-gray-600">
                              Toppings:{" "}
                              {item.placedToppings
                                .map((t) => t.name)
                                .join(", ")}
                            </p>
                          )}
                        {item.message && (
                          <p className="text-sm text-gray-600 italic mt-1">
                            Message: "{item.message}"
                          </p>
                        )}
                      </div>
                      <div className="text-right ml-4">
                        <p className="font-bold text-lg text-gray-800">
                          ₱{item.totalPrice?.toFixed(2) || "0.00"}
                        </p>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>

            <Divider className="my-6" />

            {/* Customer Information */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Customer Information
                </h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="font-medium">Name:</span>{" "}
                    {order.customerName || "N/A"}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span>{" "}
                    {order.customerEmail || "N/A"}
                  </p>
                  <p>
                    <span className="font-medium">Phone:</span>{" "}
                    {order.customerPhone || "N/A"}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Order Summary
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₱{order.totalAmount?.toFixed(2) || "0.00"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>₱0.00</span>
                  </div>
                  <Divider className="my-2" />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>₱{order.totalAmount?.toFixed(2) || "0.00"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Notes */}
            {order.deliveryNotes && (
              <>
                <Divider className="my-6" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Delivery Notes
                  </h3>
                  <p className="text-sm text-gray-600">{order.deliveryNotes}</p>
                </div>
              </>
            )}

            {/* Estimated Pickup/Delivery */}
            {order.estimatedReadyTime && (
              <>
                <Divider className="my-6" />
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-green-800">
                    📅 Estimated Ready Time:{" "}
                    {new Date(order.estimatedReadyTime).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </p>
                </div>
              </>
            )}
          </CardBody>
        </Card>

        {/* Contact Shop */}
        <Card className="shadow-lg">
          <CardBody className="p-6 text-center">
            <p className="text-gray-600 mb-2">Questions about your order?</p>
            <p className="text-sm text-gray-500">
              Contact us at{" "}
              <a
                href={`mailto:${shop?.ownerEmail}`}
                className="text-pink-600 hover:underline"
              >
                {shop?.ownerEmail}
              </a>
              {shop?.phone && (
                <>
                  {" "}
                  or call{" "}
                  <a
                    href={`tel:${shop?.phone}`}
                    className="text-pink-600 hover:underline"
                  >
                    {shop?.phone}
                  </a>
                </>
              )}
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

export default OrderTracking;
