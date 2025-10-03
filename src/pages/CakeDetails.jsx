import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "../services/firebase";
import {
  Spinner,
  Button,
  Breadcrumbs,
  BreadcrumbItem,
  Card,
  CardBody,
  CardHeader,
  Image,
  Chip,
  Checkbox,
  CheckboxGroup,
  Select,
  SelectItem,
  Divider,
} from "@nextui-org/react";
import CakeCard from "../components/CakeCard";
import { useCart } from "../context/CartContext";
import { useShop } from "../context/ShopContext";
import { getRoutePath } from "../utils/shopUtils";

export default function CakeDetails() {
  const { cakeId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { shop, shopId } = useShop();

  const [cake, setCake] = useState(null);
  const [allCakes, setAllCakes] = useState([]);
  const [similarCakes, setSimilarCakes] = useState([]);
  const [availableToppings, setAvailableToppings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Customization state
  const [selectedTier, setSelectedTier] = useState("tier1");
  const [selectedToppings, setSelectedToppings] = useState([]);
  const [quantity, setQuantity] = useState(1);



  useEffect(() => {
    const fetchData = async () => {
      if (!shopId) return;

      try {
        // Fetch current cake details
        const cakeDoc = await getDoc(
          doc(db, "cakeShops", shopId, "cakes", cakeId)
        );
        if (cakeDoc.exists()) {
          const cakeData = { id: cakeDoc.id, ...cakeDoc.data() };
          setCake(cakeData);
          
          // Set default tier to the first available tier
          if (cakeData.tierPricing && Object.keys(cakeData.tierPricing).length > 0) {
            const availableTiers = Object.entries(cakeData.tierPricing)
              .filter(([_, price]) => price !== null && price !== undefined)
              .sort(([a], [b]) => {
                const numA = parseInt(a.replace('tier', ''));
                const numB = parseInt(b.replace('tier', ''));
                return numA - numB;
              });
            if (availableTiers.length > 0) {
              setSelectedTier(availableTiers[0][0]);
            }
          }

          // Fetch all cakes to find similar ones
          const cakesSnapshot = await getDocs(
            collection(db, "cakeShops", shopId, "cakes")
          );
          const allCakesData = cakesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setAllCakes(allCakesData);

          // Fetch available toppings
          const toppingsSnapshot = await getDocs(
            collection(db, "cakeShops", shopId, "toppings")
          );
          const toppingsData = toppingsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          // Use fetched toppings or fallback to default ones if none configured yet
          if (toppingsData.length > 0) {
            setAvailableToppings(toppingsData);
          } else {
            // Default toppings as fallback
            const defaultToppings = [
              { name: "Fresh Strawberries", price: 50, category: "Fruits" },
              { name: "Chocolate Chips", price: 30, category: "Chocolates" },
              { name: "Whipped Cream", price: 25, category: "Creams" },
              { name: "Sprinkles", price: 15, category: "Decorations" },
              { name: "Cherry on Top", price: 20, category: "Fruits" },
              { name: "Nuts", price: 35, category: "Nuts" },
              { name: "Oreo Crumbs", price: 40, category: "Cookies" },
              { name: "Caramel Drizzle", price: 30, category: "Sauces" },
            ];
            setAvailableToppings(defaultToppings);
          }

          // Find similar cakes
          findSimilarCakes(cakeData, allCakesData);
        }
      } catch (error) {
        console.error("Error fetching cake data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [shopId, cakeId]);

  const findSimilarCakes = (currentCake, allCakes) => {
    // Filter out current cake and find similar ones
    const otherCakes = allCakes.filter(cake => cake.id !== currentCake.id);
    
    // Simple similarity logic: same flavors or similar price range
    const similar = otherCakes.filter(cake => {
      // Check if they share flavors
      const sharedFlavors = currentCake.flavors?.some(flavor => 
        cake.flavors?.includes(flavor)
      );
      
      // Check if price is within 30% range
      const priceRange = Math.abs(cake.basePrice - currentCake.basePrice) <= (currentCake.basePrice * 0.3);
      
      return sharedFlavors || priceRange;
    });

    // Limit to 3-4 similar cakes
    setSimilarCakes(similar.slice(0, 4));
  };

  const getTierPrice = () => {
    if (!cake?.tierPricing) {
      return cake?.basePrice || 0; // Fallback for old cakes without tier pricing
    }
    
    const tierPrice = cake.tierPricing[selectedTier];
    return tierPrice || cake.basePrice || 0;
  };

  const getTierName = () => {
    if (!cake?.tierNames) {
      const tierNumber = selectedTier.replace('tier', '');
      return `${tierNumber}-Tier Cake`;
    }
    
    return cake.tierNames[selectedTier] || `${selectedTier.replace('tier', '')}-Tier Cake`;
  };

  const calculateTotalPrice = () => {
    const tierPrice = getTierPrice();
    
    const toppingsPrice = selectedToppings.reduce((total, toppingName) => {
      const topping = availableToppings.find(t => t.name === toppingName);
      return total + (topping?.price || 0);
    }, 0);

    return (tierPrice + toppingsPrice) * quantity;
  };

  const handleAddToCart = () => {
    const orderItem = {
      shopId,
      shopName: shop?.name || "Unknown Shop",
      cakeName: cake.name,
      cakeId: cake.id,
      base: cake.name, // Cart expects 'base' field
      size: getTierName(), // Cart expects 'size' field for tier
      tier: selectedTier,
      tierName: getTierName(),
      tierPrice: getTierPrice(),
      toppings: selectedToppings,
      quantity: quantity,
      unitPrice: getTierPrice() + 
        selectedToppings.reduce((total, toppingName) => {
          const topping = availableToppings.find(t => t.name === toppingName);
          return total + (topping?.price || 0);
        }, 0),
      totalPrice: calculateTotalPrice(),
      timestamp: new Date().toISOString(),
    };

    addToCart(orderItem);
    navigate(getRoutePath("/cart", shopId));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" label="Loading cake details..." />
      </div>
    );
  }

  if (!shop || !cake) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <h2 className="text-2xl mb-4">Cake not found</h2>
        <Button color="primary" onClick={() => navigate(getRoutePath("/", shopId))}>
          Back to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <Breadcrumbs className="mb-6">
          <BreadcrumbItem onClick={() => navigate(getRoutePath("/", shopId))}>
            Home
          </BreadcrumbItem>
          <BreadcrumbItem>{cake.name}</BreadcrumbItem>
        </Breadcrumbs>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Left: Cake Image and Info */}
          <div>
            <Card>
              <CardBody className="p-0">
                <Image
                  src={cake.imageUrl || "https://via.placeholder.com/500?text=Cake"}
                  alt={cake.name}
                  className="w-full h-[400px] object-cover"
                />
              </CardBody>
            </Card>
            
            <Card className="mt-4">
              <CardBody>
                <h1 className="text-3xl font-bold mb-2">{cake.name}</h1>
                <p className="text-gray-600 mb-4">{cake.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="text-sm font-semibold">Available Flavors:</span>
                  {cake.flavors?.map((flavor, index) => (
                    <Chip key={index} color="secondary" variant="flat" size="sm">
                      {flavor}
                    </Chip>
                  ))}
                </div>

                {cake.tags && cake.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="text-sm font-semibold">Tags:</span>
                    {cake.tags.map((tag, index) => (
                      <Chip key={index} color="primary" variant="bordered" size="sm">
                        {tag}
                      </Chip>
                    ))}
                  </div>
                )}

                <Chip color="success" variant="shadow" size="lg">
                  Starting at ₱{cake.basePrice}
                </Chip>
              </CardBody>
            </Card>
          </div>

          {/* Right: Customization Options */}
          <div>
            <Card>
              <CardHeader>
                <h2 className="text-2xl font-bold">Customize Your Order</h2>
              </CardHeader>
              <CardBody className="space-y-6">
                {/* Tier Selection */}
                <div>
                  <label className="text-sm font-semibold mb-2 block">
                    Choose Cake Tier
                  </label>
                  <Select
                    selectedKeys={[selectedTier]}
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0];
                      if (selected) {
                        setSelectedTier(selected);
                      }
                    }}
                    placeholder="Select tier"
                    aria-label="Choose cake tier"
                  >
                    {cake?.tierPricing && Object.keys(cake.tierPricing).length > 0 ? (
                      Object.entries(cake.tierPricing)
                        .filter(([_, price]) => price !== null && price !== undefined)
                        .sort(([a], [b]) => {
                          const numA = parseInt(a.replace('tier', ''));
                          const numB = parseInt(b.replace('tier', ''));
                          return numA - numB;
                        })
                        .map(([tierKey, price]) => {
                          const tierNumber = tierKey.replace('tier', '');
                          const tierName = cake.tierNames?.[tierKey] || `${tierNumber}-Tier Cake`;
                          return (
                            <SelectItem key={tierKey} value={tierKey} textValue={`${tierName} - ₱${price}`}>
                              {tierName} - ₱{price}
                            </SelectItem>
                          );
                        })
                    ) : (
                      <SelectItem key="tier1" value="tier1" textValue={`1-Tier Cake - ₱${cake?.basePrice || 0}`}>
                        1-Tier Cake - ₱{cake?.basePrice || 0}
                      </SelectItem>
                    )}
                  </Select>
                </div>

                {/* Toppings Selection */}
                <div>
                  <label className="text-sm font-semibold mb-3 block">
                    Add Toppings (Optional)
                  </label>
                  <CheckboxGroup
                    value={selectedToppings}
                    onValueChange={setSelectedToppings}
                    className="gap-2"
                  >
                    <div className="grid grid-cols-1 gap-2 max-h-[200px] overflow-y-auto">
                      {availableToppings.map((topping) => (
                        <Checkbox key={topping.name} value={topping.name}>
                          <div className="flex justify-between w-full">
                            <span>{topping.name}</span>
                            <span className="text-success-600">+₱{topping.price}</span>
                          </div>
                        </Checkbox>
                      ))}
                    </div>
                  </CheckboxGroup>
                </div>

                {/* Quantity */}
                <div>
                  <label className="text-sm font-semibold mb-2 block">
                    Quantity
                  </label>
                  <Select
                    selectedKeys={[String(quantity)]}
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0];
                      if (selected) {
                        setQuantity(Number(selected));
                      }
                    }}
                    placeholder="Select quantity"
                    aria-label="Select quantity"
                  >
                    {[1, 2, 3, 4, 5].map((num) => (
                      <SelectItem key={String(num)} value={String(num)} textValue={`${num} cake${num > 1 ? 's' : ''}`}>
                        {num} cake{num > 1 ? 's' : ''}
                      </SelectItem>
                    ))}
                  </Select>
                </div>

                <Divider />

                {/* Order Summary */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Order Summary</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Cake ({getTierName()})</span>
                      <span>₱{getTierPrice()}</span>
                    </div>
                    {selectedToppings.map((toppingName) => {
                      const topping = availableToppings.find(t => t.name === toppingName);
                      return (
                        <div key={toppingName} className="flex justify-between">
                          <span>{toppingName}</span>
                          <span>+₱{topping?.price || 0}</span>
                        </div>
                      );
                    })}
                    <div className="flex justify-between">
                      <span>Quantity</span>
                      <span>× {quantity}</span>
                    </div>
                    <Divider />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>₱{calculateTotalPrice()}</span>
                    </div>
                  </div>
                </div>

                {/* Add to Cart Button */}
                <Button
                  color="primary"
                  size="lg"
                  className="w-full"
                  onClick={handleAddToCart}
                >
                  🛒 Add to Cart - ₱{calculateTotalPrice()}
                </Button>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Similar Cakes Section */}
        {similarCakes.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <h2 className="text-2xl font-bold">You Might Also Like</h2>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {similarCakes.map((similarCake) => (
                  <div key={similarCake.id} className="cursor-pointer transform hover:scale-105 transition-transform">
                    <CakeCard
                      cake={similarCake}
                      shopId={shopId}
                    />
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}