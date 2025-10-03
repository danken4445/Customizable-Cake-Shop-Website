import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  addDoc,
  query,
  orderBy 
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import CakeModal from '../components/CakeModal';
import OrderModal from '../components/OrderModal';
import ProductsTab from '../components/ProductsTab';
import OrdersTab from '../components/OrdersTab';
import SettingsTab from '../components/SettingsTab';
import ToppingsTab from '../components/ToppingsTab';
import {
  Card,
  CardBody,
  Button,
  Chip,
  useDisclosure,
  Spinner,
  Tabs,
  Tab,
  Avatar,
} from '@nextui-org/react';

export default function AdminDashboard() {
  const { shopId } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin, hasAccessToShop, signOut, loading: authLoading } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [shop, setShop] = useState(null);
  const [cakes, setCakes] = useState([]);
  const [orders, setOrders] = useState([]);
  const [toppings, setToppings] = useState([]);
  const [settings, setSettings] = useState({});
  
  // Modals
  const { isOpen: isCakeModalOpen, onOpen: onCakeModalOpen, onClose: onCakeModalClose } = useDisclosure();
  const { isOpen: isOrderModalOpen, onOpen: onOrderModalOpen, onClose: onOrderModalClose } = useDisclosure();
  
  // Form states
  const [selectedCake, setSelectedCake] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const initializeDashboard = async () => {
      // Wait for auth loading to complete
      if (authLoading) {
        return;
      }

      // If no shopId, can't proceed
      if (!shopId) {
        setLoading(false);
        return;
      }

      // Check access after auth is loaded
      if (!user || !isAdmin || !hasAccessToShop(shopId)) {
        setLoading(false);
        return;
      }

      try {
        await Promise.all([
          fetchShopData(),
          fetchCakes(),
          fetchOrders(),
          fetchToppings(),
          fetchSettings()
        ]);
      } catch (error) {
        console.error('Error initializing dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeDashboard();
  }, [authLoading, user, isAdmin, shopId]);

  const fetchShopData = async () => {
    try {
      const shopDoc = await getDoc(doc(db, 'cakeShops', shopId));
      if (shopDoc.exists()) {
        setShop({ id: shopDoc.id, ...shopDoc.data() });
      }
    } catch (error) {
      console.error('Error fetching shop:', error);
    }
  };

  const fetchCakes = async () => {
    try {
      const cakesSnapshot = await getDocs(collection(db, 'cakeShops', shopId, 'cakes'));
      const cakesData = cakesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCakes(cakesData);
    } catch (error) {
      console.error('Error fetching cakes:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const ordersQuery = query(
        collection(db, 'cakeShops', shopId, 'orders'),
        orderBy('createdAt', 'desc')
      );
      const ordersSnapshot = await getDocs(ordersQuery);
      const ordersData = ordersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOrders(ordersData);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchToppings = async () => {
    try {
      const toppingsSnapshot = await getDocs(collection(db, 'cakeShops', shopId, 'toppings'));
      const toppingsData = toppingsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setToppings(toppingsData);
    } catch (error) {
      console.error('Error fetching toppings:', error);
    }
  };

  const fetchSettings = async () => {
    try {
      const settingsDoc = await getDoc(doc(db, 'cakeShops', shopId, 'settings', 'general'));
      if (settingsDoc.exists()) {
        setSettings(settingsDoc.data());
      } else {
        // Default settings
        setSettings({
          deliveryEnabled: true,
          pickupEnabled: true,
          deliveryFee: 50,
          minimumOrder: 500,
          paymentMethods: ['Cash', 'GCash', 'Card'],
          operatingHours: '8:00 AM - 8:00 PM',
          contactNumber: '',
          address: ''
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/admin/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Cake Management
  const handleCreateCake = () => {
    setSelectedCake(null);
    onCakeModalOpen();
  };

  const handleEditCake = (cake) => {
    setSelectedCake(cake);
    onCakeModalOpen();
  };

  const handleSaveCake = async (cakeData, cakeId) => {
    try {
      if (cakeId) {
        // Update existing cake
        await updateDoc(doc(db, 'cakeShops', shopId, 'cakes', cakeId), cakeData);
        alert('Cake updated successfully!');
      } else {
        // Create new cake
        await addDoc(collection(db, 'cakeShops', shopId, 'cakes'), cakeData);
        alert('Cake created successfully!');
      }

      await fetchCakes();
    } catch (error) {
      console.error('Error saving cake:', error);
      alert('Failed to save cake');
      throw error; // Re-throw to let CakeModal handle it
    }
  };

  const handleDeleteCake = async (cakeId) => {
    try {
      await deleteDoc(doc(db, 'cakeShops', shopId, 'cakes', cakeId));
      setCakes(cakes.filter(c => c.id !== cakeId));
      alert('Cake deleted successfully');
    } catch (error) {
      console.error('Error deleting cake:', error);
      alert('Failed to delete cake');
    }
  };

  // Toppings Management
  const handleCreateTopping = async (toppingData) => {
    try {
      await addDoc(collection(db, 'cakeShops', shopId, 'toppings'), toppingData);
      alert('Topping created successfully!');
      await fetchToppings();
    } catch (error) {
      console.error('Error creating topping:', error);
      alert('Failed to create topping');
      throw error;
    }
  };

  const handleEditTopping = async (toppingData, toppingId) => {
    try {
      await updateDoc(doc(db, 'cakeShops', shopId, 'toppings', toppingId), toppingData);
      alert('Topping updated successfully!');
      await fetchToppings();
    } catch (error) {
      console.error('Error updating topping:', error);
      alert('Failed to update topping');
      throw error;
    }
  };

  const handleDeleteTopping = async (toppingId) => {
    try {
      await deleteDoc(doc(db, 'cakeShops', shopId, 'toppings', toppingId));
      setToppings(toppings.filter(t => t.id !== toppingId));
      alert('Topping deleted successfully');
    } catch (error) {
      console.error('Error deleting topping:', error);
      alert('Failed to delete topping');
    }
  };

  // Order Management
  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    onOrderModalOpen();
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await updateDoc(doc(db, 'cakeShops', shopId, 'orders', orderId), {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      
      alert('Order status updated successfully');
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order status');
    }
  };

  // Settings Management
  const handleSettingsChange = (newSettings) => {
    setSettings(newSettings);
  };

  const handleSaveSettings = async () => {
    try {
      await setDoc(doc(db, 'cakeShops', shopId, 'settings', 'general'), {
        ...settings,
        updatedAt: new Date().toISOString()
      });
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" label="Loading dashboard..." />
      </div>
    );
  }

  if (!shopId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardBody className="text-center">
            <h2 className="text-2xl font-bold mb-4">Invalid Shop</h2>
            <p className="mb-4">No shop ID provided in the URL.</p>
            <Button color="primary" onClick={() => navigate('/admin/my-shops')}>
              Back to My Shops
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (!user || !isAdmin || !hasAccessToShop(shopId)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardBody className="text-center">
            <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
            <p className="mb-4">You don't have access to this shop.</p>
            <Button color="primary" onClick={() => navigate('/admin/login')}>
              Back to Login
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <Card className="mb-8">
          <CardBody>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <Avatar
                  src={shop?.logoUrl}
                  name={shop?.name}
                  size="lg"
                  className="bg-gradient-to-br from-pink-500 to-purple-600"
                />
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                    {shop?.name || 'Shop Dashboard'}
                  </h1>
                  <p className="text-gray-600">Admin Panel</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Chip color="secondary" variant="flat">
                  {user?.email}
                </Chip>
                <Button color="danger" variant="light" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardBody className="text-center">
              <div className="text-3xl mb-2">🍰</div>
              <div className="text-2xl font-bold">{cakes.length}</div>
              <div className="text-sm text-gray-600">Total Cakes</div>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center">
              <div className="text-3xl mb-2">📋</div>
              <div className="text-2xl font-bold">{orders.length}</div>
              <div className="text-sm text-gray-600">Total Orders</div>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center">
              <div className="text-3xl mb-2">⏳</div>
              <div className="text-2xl font-bold">
                {orders.filter(o => o.status === 'pending').length}
              </div>
              <div className="text-sm text-gray-600">Pending Orders</div>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center">
              <div className="text-3xl mb-2">✅</div>
              <div className="text-2xl font-bold">
                {orders.filter(o => o.status === 'completed').length}
              </div>
              <div className="text-sm text-gray-600">Completed Orders</div>
            </CardBody>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Card>
          <CardBody>
            <Tabs aria-label="Admin tabs" size="lg" color="secondary">
              {/* Products Tab */}
              <Tab key="products" title="🍰 Products">
                <ProductsTab
                  cakes={cakes}
                  onCreateCake={handleCreateCake}
                  onEditCake={handleEditCake}
                  onDeleteCake={handleDeleteCake}
                  shopId={shopId}
                  onRefresh={fetchCakes}
                />
              </Tab>

              {/* Toppings Tab */}
              <Tab key="toppings" title="🧁 Toppings">
                <ToppingsTab
                  toppings={toppings}
                  onCreateTopping={handleCreateTopping}
                  onEditTopping={handleEditTopping}
                  onDeleteTopping={handleDeleteTopping}
                />
              </Tab>

              {/* Orders Tab */}
              <Tab key="orders" title="📋 Orders">
                <OrdersTab
                  orders={orders}
                  onViewOrder={handleViewOrder}
                  onUpdateOrderStatus={handleUpdateOrderStatus}
                />
              </Tab>

              {/* Settings Tab */}
              <Tab key="settings" title="⚙️ Settings">
                <SettingsTab
                  settings={settings}
                  onSettingsChange={handleSettingsChange}
                  onSaveSettings={handleSaveSettings}
                />
              </Tab>
            </Tabs>
          </CardBody>
        </Card>

        {/* Modals */}
        <CakeModal
          isOpen={isCakeModalOpen}
          onClose={onCakeModalClose}
          selectedCake={selectedCake}
          onSave={handleSaveCake}
          shopId={shopId}
        />

        <OrderModal
          isOpen={isOrderModalOpen}
          onClose={onOrderModalClose}
          order={selectedOrder}
          onUpdateStatus={handleUpdateOrderStatus}
        />
      </div>
    </div>
  );
}
