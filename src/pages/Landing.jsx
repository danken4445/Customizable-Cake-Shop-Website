import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../services/firebase";
import { Spinner, Card, CardBody, CardFooter, Image } from "@nextui-org/react";
import { useShop } from "../context/ShopContext";
import { getRoutePath } from "../utils/shopUtils";

export default function Landing() {
  const { shop, shopId, loading: shopLoading, error } = useShop();
  const [cakes, setCakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCakes = async () => {
      if (!shopId) return;

      try {
        const cakesCollection = collection(db, "cakeShops", shopId, "cakes");
        const cakesSnapshot = await getDocs(cakesCollection);
        const cakesData = cakesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCakes(cakesData);
      } catch (error) {
        console.error("Error fetching cakes:", error);
      } finally {
        setLoading(false);
      }
    };

    if (!shopLoading) {
      fetchCakes();
    }
  }, [shopId, shopLoading]);

  if (shopLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" label="Loading..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-600 mb-4">⚠️ Error</h1>
          <p className="text-xl text-gray-700">{error}</p>
        </div>
      </div>
    );
  }

  // Apply shop branding colors if available
  const brandColors = shop?.branding?.colors || {
    primary: "pink",
    secondary: "purple",
  };

  return (
    <div
      className="min-h-screen py-12 px-4"
      style={{
        background: `linear-gradient(to bottom right, ${brandColors.primary}10, ${brandColors.secondary}10)`,
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Shop Header with Cover Image */}
        {shop?.coverImage && (
          <div className="mb-8 rounded-2xl overflow-hidden shadow-lg">
            <Image
              src={shop.coverImage}
              alt={shop.name}
              className="w-full h-64 object-cover"
            />
          </div>
        )}

        {/* Shop Title */}
        <div className="text-center mb-12">
          {shop?.logo && (
            <Image
              src={shop.logo}
              alt={`${shop.name} logo`}
              className="w-24 h-24 mx-auto mb-4 rounded-full shadow-lg"
            />
          )}
          <h1
            className="text-5xl font-bold mb-4"
            style={{
              color: brandColors.primary,
            }}
          >
            🎂 {shop?.name || "Welcome to Our Cake Shop"}
          </h1>
          <p className="text-xl text-gray-600">
            {shop?.description || "Customize your dream cake with us!"}
          </p>
        </div>

        {/* Cakes Grid */}
        {cakes.length === 0 ? (
          <div className="text-center">
            <p className="text-xl text-gray-500">
              No cakes available yet. Check back soon! 🍰
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cakes.map((cake) => (
              <Card
                key={cake.id}
                isPressable
                onPress={() =>
                  navigate(getRoutePath(`/customize/${cake.id}`, shopId))
                }
                className="hover:scale-105 transition-transform"
              >
                <CardBody className="p-0">
                  <Image
                    src={
                      cake.image ||
                      "https://via.placeholder.com/300x200?text=Cake"
                    }
                    alt={cake.name}
                    className="w-full h-48 object-cover"
                  />
                </CardBody>
                <CardFooter className="flex flex-col items-start">
                  <h3 className="text-xl font-bold">{cake.name}</h3>
                  <p className="text-gray-600 text-sm mb-2">
                    {cake.description}
                  </p>
                  <p className="text-lg font-semibold text-pink-600">
                    Starting at ${cake.basePrice}
                  </p>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
