import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Chip,
  Spinner,
} from '@nextui-org/react';

export default function AdminShops() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, assignedShops, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAssignedShops();
  }, [assignedShops]);

  const fetchAssignedShops = async () => {
    if (assignedShops.length === 0) {
      setLoading(false);
      return;
    }

    try {
      const shopsData = [];
      for (const shopId of assignedShops) {
        const shopQuery = query(
          collection(db, 'cakeShops'),
          where('__name__', '==', shopId)
        );
        const snapshot = await getDocs(shopQuery);
        snapshot.forEach((doc) => {
          shopsData.push({ id: doc.id, ...doc.data() });
        });
      }
      setShops(shopsData);
    } catch (error) {
      console.error('Error fetching shops:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleManageShop = (shopId) => {
    navigate(`/admin/dashboard/${shopId}`);
  };

  const handleViewShop = (shopId) => {
    navigate(`/shop/${shopId}`);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/admin/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" label="Loading your shops..." />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            My Shops
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your assigned cake shops
          </p>
        </div>
        <div className="flex gap-3">
          <Chip color="primary" variant="flat">
            {user?.email}
          </Chip>
          <Button color="danger" variant="light" onPress={handleLogout}>
            Logout
          </Button>
        </div>
      </div>

      {/* Shops Grid */}
      {shops.length === 0 ? (
        <Card>
          <CardBody className="text-center py-12">
            <div className="text-6xl mb-4">🏪</div>
            <h2 className="text-xl font-semibold mb-2">No Shops Assigned</h2>
            <p className="text-gray-600">
              You don't have any shops assigned to you yet. Please contact the super admin.
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shops.map((shop) => (
            <Card key={shop.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-col items-start gap-2 pb-0">
                {shop.logoUrl && (
                  <img
                    src={shop.logoUrl}
                    alt={shop.name}
                    className="w-full h-40 object-cover rounded-lg mb-2"
                  />
                )}
                <div className="w-full">
                  <h3 className="text-xl font-bold">{shop.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {shop.description || 'No description'}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <Chip
                      size="sm"
                      color={shop.isActive ? 'success' : 'warning'}
                      variant="flat"
                    >
                      {shop.isActive ? 'Active' : 'Inactive'}
                    </Chip>
                    <Chip size="sm" variant="flat">
                      ID: {shop.id}
                    </Chip>
                  </div>
                </div>
              </CardHeader>
              <CardBody className="pt-4">
                <div className="flex gap-2">
                  <Button
                    color="primary"
                    size="sm"
                    className="flex-1"
                    onPress={() => handleManageShop(shop.id)}
                  >
                    Manage Shop
                  </Button>
                  <Button
                    color="secondary"
                    variant="bordered"
                    size="sm"
                    className="flex-1"
                    onPress={() => handleViewShop(shop.id)}
                  >
                    View Storefront
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
