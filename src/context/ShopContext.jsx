import { createContext, useContext, useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { getShopId } from "../utils/shopUtils";

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

  useEffect(() => {
    const fetchShop = async () => {
      try {
        const currentShopId = getShopId();
        setShopId(currentShopId);

        if (!currentShopId) {
          setError("Shop not found. Please check the URL.");
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
  }, []);

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
