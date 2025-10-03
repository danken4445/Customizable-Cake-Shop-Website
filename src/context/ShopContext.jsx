import { createContext, useContext, useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../services/firebase";

const ShopContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error("useShop must be used within ShopProvider");
  }
  return context;
};

export const ShopProvider = ({ children }) => {
  const [shop, setShop] = useState(null);
  const [shopId, setShopId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const fetchShop = async () => {
      try {
        // Extract shopId from URL path: /shop/:shopId/...
        const pathSegments = location.pathname.split("/").filter(Boolean);
        let currentShopId = null;

        if (pathSegments.length >= 2 && pathSegments[0] === "shop") {
          currentShopId = pathSegments[1];
        }

        setShopId(currentShopId);

        if (!currentShopId) {
          setError(null); // No error for routes that don't need shopId (onboarding, dashboard)
          setLoading(false);
          return;
        }

        const shopDoc = await getDoc(doc(db, "cakeShops", currentShopId));

        if (shopDoc.exists()) {
          setShop({ id: shopDoc.id, ...shopDoc.data() });
          setError(null);
        } else {
          setError(`Shop "${currentShopId}" not found. Please check the URL.`);
          setShop(null);
        }
      } catch (err) {
        console.error("Error fetching shop:", err);
        setError("Failed to load shop data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchShop();
  }, [location.pathname]);

  return (
    <ShopContext.Provider
      value={{
        shop,
        shopId,
        loading,
        error,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};
