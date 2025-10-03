import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../services/firebase";
import {
  Spinner,
  Button,
  Breadcrumbs,
  BreadcrumbItem,
} from "@nextui-org/react";
import CakeCard from "../components/CakeCard";

export default function ShopShowcase() {
  const { shopId } = useParams();
  const navigate = useNavigate();
  const [shop, setShop] = useState(null);
  const [cakes, setCakes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShopAndCakes = async () => {
      try {
        // Fetch shop details
        const shopDoc = await getDoc(doc(db, "cakeShops", shopId));
        if (shopDoc.exists()) {
          setShop({ id: shopDoc.id, ...shopDoc.data() });
        }

        // Fetch cakes
        const cakesCollection = collection(db, "cakeShops", shopId, "cakes");
        const cakesSnapshot = await getDocs(cakesCollection);
        const cakesData = cakesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCakes(cakesData);
      } catch (error) {
        console.error("Error fetching shop data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchShopAndCakes();
  }, [shopId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" label="Loading cakes..." />
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <h2 className="text-2xl mb-4">Shop not found</h2>
        <Button color="primary" onClick={() => navigate("/")}>
          Back to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <Breadcrumbs className="mb-6">
          <BreadcrumbItem onClick={() => navigate("/")}>Home</BreadcrumbItem>
          <BreadcrumbItem>{shop.name}</BreadcrumbItem>
        </Breadcrumbs>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600 mb-2">
            {shop.name}
          </h1>
          <p className="text-lg text-gray-600">{shop.description}</p>
        </div>

        {cakes.length === 0 ? (
          <div className="text-center">
            <p className="text-xl text-gray-500 mb-6">
              No cakes available yet. Check back soon! 🍰
            </p>
            <Button color="primary" onClick={() => navigate("/")}>
              Browse Other Shops
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cakes.map((cake) => (
              <CakeCard key={cake.id} cake={cake} shopId={shopId} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
