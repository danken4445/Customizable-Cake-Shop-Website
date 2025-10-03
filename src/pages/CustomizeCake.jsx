import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  Spinner,
  Button,
  Breadcrumbs,
  BreadcrumbItem,
  Select,
  SelectItem,
  Card,
  CardBody,
  Divider,
  Chip,
} from "@nextui-org/react";
import CakeCanvas from "../components/CakeCanvas";
import ToppingItem from "../components/ToppingItem";
import { useCart } from "../context/CartContext";
import { useShop } from "../context/ShopContext";
import { getRoutePath } from "../utils/shopUtils";

export default function CustomizeCake() {
  const { cakeId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { shop, shopId } = useShop();

  const [cake, setCake] = useState(null);
  const [options, setOptions] = useState(null);
  const [loading, setLoading] = useState(true);

  // Customization state
  const [selectedBase, setSelectedBase] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [placedToppings, setPlacedToppings] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!shopId) return;

      try {
        // Fetch cake details
        const cakeDoc = await getDoc(
          doc(db, "cakeShops", shopId, "cakes", cakeId)
        );
        if (cakeDoc.exists()) {
          setCake({ id: cakeDoc.id, ...cakeDoc.data() });
        }

        // Fetch customization options
        const optionsDoc = await getDoc(
          doc(db, "cakeShops", shopId, "options", "customizer")
        );
        if (optionsDoc.exists()) {
          const optionsData = optionsDoc.data();
          setOptions(optionsData);
          // Set default values
          if (optionsData.bases?.length > 0) {
            setSelectedBase(optionsData.bases[0]);
          }
          if (optionsData.sizes) {
            const firstSize = Object.keys(optionsData.sizes)[0];
            setSelectedSize(firstSize);
          }
        }
      } catch (error) {
        console.error("Error fetching customization data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [shopId, cakeId]);

  const calculateTotalPrice = () => {
    let total = cake?.basePrice || 0;

    // Add size price
    if (selectedSize && options?.sizes) {
      total = options.sizes[selectedSize] || total;
    }

    // Add toppings price
    placedToppings.forEach((topping) => {
      const toppingPrice = Number(topping.price) || 0;
      total += toppingPrice;
    });

    return total;
  };

  const handleToppingAdd = (topping) => {
    setPlacedToppings((prev) => [...prev, topping]);
  };

  const handleToppingRemove = (toppingId) => {
    setPlacedToppings((prev) => prev.filter((t) => t.id !== toppingId));
  };

  const handleAddToCart = () => {
    const customCake = {
      shopId,
      shopName: shop?.name || "Unknown Shop",
      cakeName: cake.name,
      base: selectedBase,
      size: selectedSize,
      toppings: placedToppings.map((t) => String(t.name || 'Unknown')),
      totalPrice: calculateTotalPrice(),
      timestamp: new Date().toISOString(),
    };

    addToCart(customCake);
    navigate(getRoutePath("/cart", shopId));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" label="Loading customizer..." />
      </div>
    );
  }

  if (!shop || !cake || !options) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <h2 className="text-2xl mb-4">Customization not available</h2>
        <Button color="primary" onClick={() => navigate("/")}>
          Back to Home
        </Button>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <Breadcrumbs className="mb-6">
            <BreadcrumbItem onClick={() => navigate(getRoutePath("/", shopId))}>
              Home
            </BreadcrumbItem>
            <BreadcrumbItem>Customize {cake.name}</BreadcrumbItem>
          </Breadcrumbs>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Cake Canvas */}
            <div>
              <h2 className="text-3xl font-bold mb-4">Design Your Cake</h2>
              <CakeCanvas
                cakeImage={
                  cake.imageUrl || "https://via.placeholder.com/400?text=Cake"
                }
                onToppingAdd={handleToppingAdd}
                placedToppings={placedToppings}
                onToppingRemove={handleToppingRemove}
              />

              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  💡 <strong>Tip:</strong> Drag toppings onto the cake. Click to
                  remove them.
                </p>
              </div>
            </div>

            {/* Right: Customization Options */}
            <div>
              <Card>
                <CardBody className="gap-4">
                  <h2 className="text-2xl font-bold">Customize Options</h2>

                  {/* Cake Base */}
                  {options.bases && options.bases.length > 0 && (
                    <div>
                      <label className="text-sm font-semibold mb-2 block">
                        Cake Base
                      </label>
                      <Select
                        selectedKeys={selectedBase ? [selectedBase] : []}
                        onSelectionChange={(keys) => {
                          const selected = Array.from(keys)[0];
                          setSelectedBase(selected);
                        }}
                        placeholder="Select cake base"
                        aria-label="Select cake base"
                      >
                        {options.bases.map((base) => (
                          <SelectItem key={base} value={base} textValue={base}>
                            {base}
                          </SelectItem>
                        ))}
                      </Select>
                    </div>
                  )}

                  {/* Size */}
                  {options.sizes && (
                    <div>
                      <label className="text-sm font-semibold mb-2 block">
                        Size
                      </label>
                      <Select
                        selectedKeys={selectedSize ? [selectedSize] : []}
                        onSelectionChange={(keys) => {
                          const selected = Array.from(keys)[0];
                          setSelectedSize(selected);
                        }}
                        placeholder="Select size"
                        aria-label="Select size"
                      >
                        {Object.entries(options.sizes).map(([size, price]) => (
                          <SelectItem key={size} value={size} textValue={`${size} - ₱${price}`}>
                            {size} - ₱{price}
                          </SelectItem>
                        ))}
                      </Select>
                    </div>
                  )}

                  <Divider />

                  {/* Toppings */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">
                      Available Toppings
                    </h3>
                    <div className="grid grid-cols-3 gap-2 max-h-[300px] overflow-y-auto">
                      {options.toppings &&
                        options.toppings.map((topping, index) => (
                          <ToppingItem key={index} topping={topping} />
                        ))}
                    </div>
                  </div>

                  <Divider />

                  {/* Selected Toppings */}
                  <div>
                    <h3 className="text-sm font-semibold mb-2">
                      Selected Toppings:
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {placedToppings.length === 0 ? (
                        <p className="text-sm text-gray-500">No toppings yet</p>
                      ) : (
                        placedToppings.map((topping) => (
                          <Chip
                            key={topping.id}
                            color="secondary"
                            variant="flat"
                            size="sm"
                          >
                            {String(topping.name)} (+₱{String(topping.price)})
                          </Chip>
                        ))
                      )}
                    </div>
                  </div>

                  <Divider />

                  {/* Price Summary */}
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-lg font-semibold">
                        Total Price:
                      </span>
                      <Chip
                        color="success"
                        variant="shadow"
                        size="lg"
                        className="text-xl font-bold"
                      >
                        ₱{calculateTotalPrice()}
                      </Chip>
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <p>Base: {selectedBase || "None"}</p>
                      <p>Size: {selectedSize || "None"}</p>
                      <p>Toppings: {placedToppings.length} items</p>
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <Button
                    color="primary"
                    size="lg"
                    className="w-full"
                    onClick={handleAddToCart}
                    disabled={!selectedBase || !selectedSize}
                  >
                    🛒 Add to Cart - ₱{calculateTotalPrice()}
                  </Button>
                </CardBody>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  );
}
