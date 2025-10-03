import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db, auth } from "../services/firebase";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { useShop } from "../context/ShopContext";
import { getRoutePath } from "../utils/shopUtils";
import {
  Spinner,
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Input,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Select,
  SelectItem,
} from "@nextui-org/react";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { shop, shopId } = useShop();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setIsAuthenticated(true);
        if (shopId) {
          fetchShopData();
        }
      } else {
        setIsAuthenticated(false);
      }
    });

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shopId]);

  const fetchShopData = async () => {
    if (!shopId) return;

    setLoading(true);
    try {
      // Fetch orders
      const ordersCollection = collection(db, "cakeShops", shopId, "orders");
      const ordersSnapshot = await getDocs(ordersCollection);
      const ordersData = ordersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOrders(
        ordersData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      );
    } catch (error) {
      console.error("Error fetching shop data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Login error:", error);
      setLoginError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setIsAuthenticated(false);
    navigate(getRoutePath("/", shopId));
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const orderRef = doc(db, "cakeShops", shopId, "orders", orderId);
      await updateDoc(orderRef, { status: newStatus });

      // Update local state
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update order status");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "warning";
      case "preparing":
        return "primary";
      case "ready":
        return "success";
      case "completed":
        return "default";
      case "cancelled":
        return "danger";
      default:
        return "default";
    }
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-12 px-4">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <h1 className="text-3xl font-bold">Shop Owner Login</h1>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleLogin} className="space-y-4">
                <Input
                  label="Email"
                  type="email"
                  placeholder="owner@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Input
                  label="Password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                {loginError && (
                  <p className="text-red-500 text-sm">{loginError}</p>
                )}
                <Button
                  color="primary"
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? <Spinner size="sm" color="white" /> : "Login"}
                </Button>
                <Button
                  color="default"
                  variant="light"
                  className="w-full"
                  onClick={() => navigate("/")}
                >
                  Back to Home
                </Button>
              </form>
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }

  // Admin Dashboard
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" label="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold">Admin Dashboard</h1>
            <p className="text-xl text-gray-600">{shop?.name}</p>
          </div>
          <Button color="danger" variant="flat" onClick={handleLogout}>
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardBody>
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-3xl font-bold">{orders.length}</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-sm text-gray-600">Pending Orders</p>
              <p className="text-3xl font-bold text-orange-600">
                {orders.filter((o) => o.status === "pending").length}
              </p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-3xl font-bold text-green-600">
                ₱{orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0)}
              </p>
            </CardBody>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <h2 className="text-2xl font-bold">Orders</h2>
          </CardHeader>
          <CardBody>
            {orders.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No orders yet</p>
            ) : (
              <Table aria-label="Orders table">
                <TableHeader>
                  <TableColumn>ORDER ID</TableColumn>
                  <TableColumn>CUSTOMER</TableColumn>
                  <TableColumn>CONTACT</TableColumn>
                  <TableColumn>ITEMS</TableColumn>
                  <TableColumn>TOTAL</TableColumn>
                  <TableColumn>STATUS</TableColumn>
                  <TableColumn>ACTIONS</TableColumn>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-xs">
                        {order.id.slice(0, 8)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-semibold">{order.customerName}</p>
                          <p className="text-xs text-gray-500">
                            {order.address}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{order.contact}</TableCell>
                      <TableCell>
                        {order.items?.map((item, i) => (
                          <div key={i} className="text-xs">
                            {item.cake} ({item.size})
                          </div>
                        ))}
                      </TableCell>
                      <TableCell className="font-bold">
                        ₱{order.totalPrice}
                      </TableCell>
                      <TableCell>
                        <Chip
                          color={getStatusColor(order.status)}
                          variant="flat"
                        >
                          {order.status}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <Select
                          size="sm"
                          selectedKeys={[order.status]}
                          onChange={(e) =>
                            handleStatusChange(order.id, e.target.value)
                          }
                          className="w-32"
                        >
                          <SelectItem key="pending" value="pending">
                            Pending
                          </SelectItem>
                          <SelectItem key="preparing" value="preparing">
                            Preparing
                          </SelectItem>
                          <SelectItem key="ready" value="ready">
                            Ready
                          </SelectItem>
                          <SelectItem key="completed" value="completed">
                            Completed
                          </SelectItem>
                          <SelectItem key="cancelled" value="cancelled">
                            Cancelled
                          </SelectItem>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
