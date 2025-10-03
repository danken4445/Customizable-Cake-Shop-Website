import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, getDocs, doc, deleteDoc, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Spinner,
  Tabs,
  Tab,
  Input,
  Select,
  SelectItem,
} from '@nextui-org/react';

export default function SuperAdminDashboard() {
  const { user, isSuperAdmin, signOut: authSignOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [shops, setShops] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [selectedShop, setSelectedShop] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isAdminModalOpen,
    onOpen: onAdminModalOpen,
    onClose: onAdminModalClose,
  } = useDisclosure();
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [selectedShopsForAdmin, setSelectedShopsForAdmin] = useState(new Set());
  const [creatingAdmin, setCreatingAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isSuperAdmin) {
      fetchShops();
      fetchAdmins();
      setLoading(false);
    }
  }, [isSuperAdmin]);

  const fetchShops = async () => {
    try {
      const shopsSnapshot = await getDocs(collection(db, 'cakeShops'));
      const shopsData = shopsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setShops(shopsData);
    } catch (error) {
      console.error('Error fetching shops:', error);
    }
  };

  const fetchAdmins = async () => {
    try {
      const adminsSnapshot = await getDocs(collection(db, 'admins'));
      const adminsData = adminsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAdmins(adminsData);
    } catch (error) {
      console.error('Error fetching admins:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await authSignOut();
      navigate('/admin/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleViewShop = (shopId) => {
    navigate(`/shop/${shopId}`);
  };

  const handleDeleteShop = (shop) => {
    setSelectedShop(shop);
    onOpen();
  };

  const confirmDelete = async () => {
    if (!selectedShop) return;

    try {
      await deleteDoc(doc(db, 'cakeShops', selectedShop.id));
      setShops(shops.filter((s) => s.id !== selectedShop.id));
      onClose();
      setSelectedShop(null);
    } catch (error) {
      console.error('Error deleting shop:', error);
      alert('Failed to delete shop. Please try again.');
    }
  };

  const handleToggleActive = async (shop) => {
    try {
      const newStatus = !shop.isActive;
      await updateDoc(doc(db, 'cakeShops', shop.id), {
        isActive: newStatus,
      });
      setShops(
        shops.map((s) =>
          s.id === shop.id ? { ...s, isActive: newStatus } : s
        )
      );
    } catch (error) {
      console.error('Error updating shop status:', error);
    }
  };

  const handleCreateAdmin = async () => {
    if (!newAdminEmail || !newAdminEmail.trim() || !newAdminPassword) {
      alert('Please fill in all fields');
      return;
    }

    if (selectedShopsForAdmin.size === 0) {
      alert('Please assign at least one shop to the admin');
      return;
    }

    setCreatingAdmin(true);

    // Store credentials for the alert
    const adminEmail = newAdminEmail.trim();
    const adminPassword = newAdminPassword;
    const shopsToAssign = Array.from(selectedShopsForAdmin);

    try {
      // Show warning about being logged out
      if (!confirm(
        '⚠️ WARNING: Creating an admin will log you out!\n\n' +
        'This happens because Firebase automatically signs in as the new user.\n\n' +
        'After clicking OK:\n' +
        '1. Admin account will be created\n' +
        '2. You will be logged out\n' +
        '3. Log back in as super admin\n\n' +
        'Continue?'
      )) {
        setCreatingAdmin(false);
        return;
      }

      // WORKAROUND: Since we'll be logged out after createUser,
      // we need to save the UID somewhere we can access after logout.
      // We'll use localStorage temporarily.
      
      // Step 1: Create the Firebase Auth user (this will log us out as super admin)
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        adminEmail,
        adminPassword
      );

      const adminUid = userCredential.user.uid;

      // Step 2: Now we're logged in as the new admin
      // Create the Firestore document while we still have the session
      await setDoc(doc(db, 'admins', adminUid), {
        email: adminEmail,
        assignedShops: shopsToAssign,
        createdAt: new Date().toISOString(),
        createdBy: user?.uid || 'unknown', // user might be null now
      });

      // Step 3: Sign out the newly created admin
      await authSignOut();

      // Step 4: Show success and redirect to login
      alert(
        '✅ Admin created successfully!\n\n' +
        `📧 Email: ${adminEmail}\n` +
        `🔑 Password: ${adminPassword}\n` +
        `🏪 Shops: ${shopsToAssign.length} assigned\n\n` +
        '👉 Please log back in as super admin to continue.'
      );

      // Navigate to login
      navigate('/admin/login');
      
    } catch (error) {
      console.error('Error creating admin:', error);
      
      let errorMessage = 'Failed to create admin. ';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage += 'This email is already in use.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage += 'Password should be at least 6 characters.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage += 'Invalid email address.';
      } else if (error.message?.includes('permission')) {
        errorMessage += 'Permission error. Make sure Firestore rules allow admin creation.';
      } else {
        errorMessage += error.message || 'Please try again.';
      }
      
      alert(errorMessage);
      setCreatingAdmin(false);
    }
  };

  const handleDeleteAdmin = async (adminId) => {
    if (!confirm('Are you sure you want to delete this admin?')) return;

    try {
      await deleteDoc(doc(db, 'admins', adminId));
      setAdmins(admins.filter((a) => a.id !== adminId));
      alert('Admin deleted successfully');
    } catch (error) {
      console.error('Error deleting admin:', error);
      alert('Failed to delete admin');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" label="Loading..." />
      </div>
    );
  }

  if (!isSuperAdmin) {
    return null; // Will redirect via ProtectedRoute
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Super Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Manage shops and admins on the platform
          </p>
        </div>
        <div className="flex gap-3">
          <Chip color="secondary" variant="flat">
            {user?.email}
          </Chip>
          <Button color="danger" variant="light" onPress={handleLogout}>
            Logout
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardBody>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-2xl">🏪</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Shops</p>
                <p className="text-2xl font-bold">{shops.length}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-2xl">✅</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Shops</p>
                <p className="text-2xl font-bold">
                  {shops.filter((s) => s.isActive).length}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-2xl">⏸️</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Inactive Shops</p>
                <p className="text-2xl font-bold">
                  {shops.filter((s) => !s.isActive).length}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-2xl">👥</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Admins</p>
                <p className="text-2xl font-bold">{admins.length}</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Tabs for Shops and Admins */}
      <Tabs aria-label="Dashboard tabs" size="lg" color="secondary">
        <Tab key="shops" title="🏪 Shops">
          <Card>
            <CardHeader className="flex justify-between">
              <h2 className="text-xl font-semibold">All Cake Shops</h2>
              <Button
                color="primary"
                onPress={() => navigate('/onboarding')}
                size="sm"
              >
                + Create New Shop
              </Button>
            </CardHeader>
            <CardBody>
              <Table aria-label="Shops table">
                <TableHeader>
                  <TableColumn>SHOP NAME</TableColumn>
                  <TableColumn>SHOP ID</TableColumn>
                  <TableColumn>OWNER EMAIL</TableColumn>
                  <TableColumn>STATUS</TableColumn>
                  <TableColumn>ACTIONS</TableColumn>
                </TableHeader>
                <TableBody emptyContent="No shops found">
                  {shops.map((shop) => (
                    <TableRow key={shop.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {shop.logoUrl && (
                            <img
                              src={shop.logoUrl}
                              alt={shop.name}
                              className="w-8 h-8 rounded object-cover"
                            />
                          )}
                          <span className="font-medium">{shop.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {shop.id}
                        </code>
                      </TableCell>
                      <TableCell>{shop.ownerEmail || 'N/A'}</TableCell>
                      <TableCell>
                        <Chip
                          color={shop.isActive ? 'success' : 'warning'}
                          variant="flat"
                          size="sm"
                        >
                          {shop.isActive ? 'Active' : 'Inactive'}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            color="primary"
                            variant="light"
                            onPress={() => handleViewShop(shop.id)}
                          >
                            View
                          </Button>
                          <Button
                            size="sm"
                            color={shop.isActive ? 'warning' : 'success'}
                            variant="light"
                            onPress={() => handleToggleActive(shop)}
                          >
                            {shop.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                          <Button
                            size="sm"
                            color="danger"
                            variant="light"
                            onPress={() => handleDeleteShop(shop)}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardBody>
          </Card>
        </Tab>

        <Tab key="admins" title="👥 Admins">
          <Card>
            <CardHeader className="flex justify-between">
              <h2 className="text-xl font-semibold">Shop Admins</h2>
              <Button color="primary" onPress={onAdminModalOpen} size="sm">
                + Create New Admin
              </Button>
            </CardHeader>
            <CardBody>
              <Table aria-label="Admins table">
                <TableHeader>
                  <TableColumn>EMAIL</TableColumn>
                  <TableColumn>ASSIGNED SHOPS</TableColumn>
                  <TableColumn>CREATED</TableColumn>
                  <TableColumn>ACTIONS</TableColumn>
                </TableHeader>
                <TableBody emptyContent="No admins found">
                  {admins.map((admin) => (
                    <TableRow key={admin.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">👤</span>
                          <span className="font-medium">{admin.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {admin.assignedShops?.map((shopId) => {
                            const shop = shops.find((s) => s.id === shopId);
                            return (
                              <Chip key={shopId} size="sm" variant="flat">
                                {shop?.name || shopId}
                              </Chip>
                            );
                          })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {admin.createdAt
                            ? new Date(admin.createdAt).toLocaleDateString()
                            : 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          color="danger"
                          variant="light"
                          onPress={() => handleDeleteAdmin(admin.id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardBody>
          </Card>
        </Tab>
      </Tabs>

      {/* Delete Shop Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>Confirm Deletion</ModalHeader>
          <ModalBody>
            <p>
              Are you sure you want to delete{' '}
              <strong>{selectedShop?.name}</strong>?
            </p>
            <p className="text-sm text-gray-600 mt-2">
              This action cannot be undone. All cakes, orders, and data
              associated with this shop will be permanently deleted.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>
              Cancel
            </Button>
            <Button color="danger" onPress={confirmDelete}>
              Delete Shop
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Create Admin Modal */}
      <Modal isOpen={isAdminModalOpen} onClose={onAdminModalClose} size="2xl">
        <ModalContent>
          <ModalHeader>Create New Admin</ModalHeader>
          <ModalBody>
            <div className="flex flex-col gap-4">
              <Input
                label="Admin Email"
                type="email"
                placeholder="admin@example.com"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                variant="bordered"
              />
              <Input
                label="Password"
                type="password"
                placeholder="Min 6 characters"
                value={newAdminPassword}
                onChange={(e) => setNewAdminPassword(e.target.value)}
                variant="bordered"
              />
              <Select
                label="Assign Shops"
                placeholder="Select shops to assign"
                selectionMode="multiple"
                selectedKeys={selectedShopsForAdmin}
                onSelectionChange={setSelectedShopsForAdmin}
                variant="bordered"
              >
                {shops.map((shop) => (
                  <SelectItem key={shop.id} value={shop.id}>
                    {shop.name}
                  </SelectItem>
                ))}
              </Select>
              <p className="text-sm text-gray-600">
                The admin will only be able to manage the shops you assign to
                them.
              </p>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onAdminModalClose}>
              Cancel
            </Button>
            <Button
              color="primary"
              onPress={handleCreateAdmin}
              isLoading={creatingAdmin}
            >
              Create Admin
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
