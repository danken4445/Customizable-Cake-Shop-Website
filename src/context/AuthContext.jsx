import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null); // 'superAdmin' or 'admin'
  const [assignedShops, setAssignedShops] = useState([]); // For admins: shops they manage
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          // Get custom claims (for superAdmin)
          const idTokenResult = await currentUser.getIdTokenResult();
          
          if (idTokenResult.claims.superAdmin) {
            // User is a super admin
            setUser(currentUser);
            setUserRole('superAdmin');
            setAssignedShops([]); // Super admins have access to all shops
          } else {
            // Check if user is a regular admin
            const adminDoc = await getDoc(doc(db, 'admins', currentUser.uid));
            
            if (adminDoc.exists()) {
              const adminData = adminDoc.data();
              setUser(currentUser);
              setUserRole('admin');
              setAssignedShops(adminData.assignedShops || []);
            } else {
              // User exists but has no role - sign them out
              await firebaseSignOut(auth);
              setUser(null);
              setUserRole(null);
              setAssignedShops([]);
            }
          }
        } catch (error) {
          console.error('Error checking user role:', error);
          setUser(null);
          setUserRole(null);
          setAssignedShops([]);
        }
      } else {
        setUser(null);
        setUserRole(null);
        setAssignedShops([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setUserRole(null);
      setAssignedShops([]);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const hasAccessToShop = (shopId) => {
    if (userRole === 'superAdmin') return true;
    if (userRole === 'admin') return assignedShops.includes(shopId);
    return false;
  };

  const value = {
    user,
    userRole,
    assignedShops,
    loading,
    signOut,
    hasAccessToShop,
    isSuperAdmin: userRole === 'superAdmin',
    isAdmin: userRole === 'admin',
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
