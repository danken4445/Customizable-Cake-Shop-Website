import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../services/firebase";
import { Spinner, Card, CardBody, CardFooter, Image, Chip, Input, Button } from "@nextui-org/react";
import { useShop } from "../context/ShopContext";
import { getRoutePath } from "../utils/shopUtils";

export default function Landing() {
  const { shop, shopId, loading: shopLoading, error } = useShop();
  const [cakes, setCakes] = useState([]);
  const [filteredCakes, setFilteredCakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTags, setSelectedTags] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [allTags, setAllTags] = useState([]);
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
        setFilteredCakes(cakesData);
        
        // Extract all unique tags from cakes
        const tags = new Set();
        cakesData.forEach(cake => {
          if (cake.tags) {
            cake.tags.forEach(tag => tags.add(tag));
          }
        });
        setAllTags(Array.from(tags));
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

  // Filter cakes based on selected tags and search term
  useEffect(() => {
    let filtered = cakes;

    // Filter by search term (name or description)
    if (searchTerm) {
      filtered = filtered.filter(cake => 
        cake.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cake.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by selected tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(cake => 
        cake.tags && selectedTags.every(tag => cake.tags.includes(tag))
      );
    }

    setFilteredCakes(filtered);
  }, [cakes, selectedTags, searchTerm]);

  const handleTagClick = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const clearAllFilters = () => {
    setSelectedTags([]);
    setSearchTerm("");
  };

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
        <div className="text-center mb-16">
          {shop?.logo && (
            <div className="mb-6">
              <Image
                src={shop.logo}
                alt={`${shop.name} logo`}
                className="w-32 h-32 mx-auto rounded-full shadow-2xl border-4 border-white"
              />
            </div>
          )}
          <h1
            className="text-6xl md:text-7xl font-extrabold mb-6 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent"
          >
            🎂 {shop?.name || "Welcome to Our Cake Shop"}
          </h1>
          <p className="text-2xl text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed">
            {shop?.description || "Discover amazing custom cakes made with love, crafted to perfection for your special moments!"}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              color="primary"
              size="lg"
              className="bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              🛍️ Browse Our Cakes
            </Button>
            <Button
              variant="bordered"
              size="lg"
              className="border-2 border-pink-300 text-pink-600 font-semibold px-8 py-3 hover:bg-pink-50 transition-all duration-300"
            >
              📞 Contact Us
            </Button>
          </div>
        </div>

        {/* Search and Filter Section */}
        {cakes.length > 0 && (
          <div className="mb-12">
            {/* Search Bar */}
            <div className="mb-8">
              <div className="max-w-2xl mx-auto">
                <Input
                  placeholder="🔍 Search for your perfect cake..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  size="lg"
                  variant="bordered"
                  isClearable
                  onClear={() => setSearchTerm("")}
                  className="text-lg"
                  classNames={{
                    input: "text-lg",
                    inputWrapper: "h-14 bg-white/80 backdrop-blur-sm border-2 border-pink-200 hover:border-pink-400 focus-within:border-pink-500 shadow-lg"
                  }}
                />
              </div>
            </div>

            {/* Tag Filters */}
            {allTags.length > 0 && (
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-pink-100">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">🏷️ Find Cakes by Category</h3>
                  <p className="text-gray-600">Click on tags to filter cakes that match your occasion</p>
                </div>
                <div className="flex flex-wrap justify-center gap-3 mb-6">
                  {allTags.map((tag) => (
                    <Chip
                      key={tag}
                      onClick={() => handleTagClick(tag)}
                      className="cursor-pointer transform hover:scale-105 transition-all duration-200 shadow-sm"
                      color={selectedTags.includes(tag) ? "primary" : "default"}
                      variant={selectedTags.includes(tag) ? "solid" : "bordered"}
                      size="lg"
                    >
                      {selectedTags.includes(tag) ? '✓ ' : ''}{tag}
                    </Chip>
                  ))}
                </div>
                
                {/* Active Filters & Clear Button */}
                {(selectedTags.length > 0 || searchTerm) && (
                  <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-4 mb-4">
                    <div className="flex flex-wrap justify-center items-center gap-3">
                      <span className="text-sm font-semibold text-gray-700">🎯 Active filters:</span>
                      {searchTerm && (
                        <Chip size="md" variant="flat" color="secondary" className="shadow-sm">
                          🔍 "{searchTerm}"
                        </Chip>
                      )}
                      {selectedTags.map(tag => (
                        <Chip key={tag} size="md" variant="flat" color="primary" className="shadow-sm">
                          🏷️ {tag}
                        </Chip>
                      ))}
                      <Button
                        size="sm"
                        variant="light"
                        color="danger"
                        className="font-medium hover:bg-red-100 transition-colors"
                        onClick={clearAllFilters}
                      >
                        ❌ Clear all
                      </Button>
                    </div>
                  </div>
                )}

                {/* Results Count */}
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-md border border-pink-200">
                    <span className="text-lg">🍰</span>
                    <span className="font-semibold text-gray-700">
                      Showing {filteredCakes.length} of {cakes.length} delicious cakes
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Cakes Grid */}
        {cakes.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-12 max-w-md mx-auto border border-pink-200 shadow-xl">
              <div className="text-6xl mb-6">🍰</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">No Cakes Yet!</h3>
              <p className="text-lg text-gray-600 mb-6">
                Our bakers are working hard to create amazing cakes for you.
              </p>
              <Button
                color="primary"
                size="lg"
                className="bg-gradient-to-r from-pink-500 to-purple-600 font-semibold"
              >
                📞 Contact Us for Custom Orders
              </Button>
            </div>
          </div>
        ) : filteredCakes.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-12 max-w-md mx-auto border border-pink-200 shadow-xl">
              <div className="text-6xl mb-6">🔍</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">No Matches Found</h3>
              <p className="text-lg text-gray-600 mb-6">
                Try adjusting your search terms or selected filters to find the perfect cake.
              </p>
              <Button
                variant="bordered"
                size="lg"
                className="border-2 border-pink-400 text-pink-600 font-semibold"
                onPress={clearAllFilters}
              >
                ❌ Clear All Filters
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredCakes.map((cake) => (
              <Card
                key={cake.id}
                isPressable
                onPress={() =>
                  navigate(getRoutePath(`/cake/${cake.id}`, shopId))
                }
                className="group hover:scale-105 hover:shadow-2xl transition-all duration-300 bg-white/80 backdrop-blur-sm border border-pink-100 overflow-hidden"
              >
                <CardBody className="p-0 relative">
                  <div className="relative overflow-hidden">
                    <Image
                      src={
                        cake.imageUrl ||
                        "https://via.placeholder.com/300x200?text=🎂+Cake"
                      }
                      alt={cake.name}
                      className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute top-3 right-3">
                      <Chip
                        color="success"
                        variant="shadow"
                        className="bg-white/90 backdrop-blur-sm text-green-700 font-semibold"
                      >
                        ⭐ Popular
                      </Chip>
                    </div>
                  </div>
                </CardBody>
                <CardFooter className="flex flex-col items-start p-6 bg-gradient-to-br from-white to-pink-50/50">
                  <div className="w-full">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-pink-600 transition-colors">
                      {cake.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                      {cake.description || "Delicious handcrafted cake made with premium ingredients"}
                    </p>
                    
                    {/* Tags Preview */}
                    {cake.tags && cake.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {cake.tags.slice(0, 2).map((tag, idx) => (
                          <Chip key={idx} size="sm" variant="flat" color="primary" className="text-xs">
                            {tag}
                          </Chip>
                        ))}
                        {cake.tags.length > 2 && (
                          <Chip size="sm" variant="flat" className="text-xs">
                            +{cake.tags.length - 2}
                          </Chip>
                        )}
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center w-full">
                      <div>
                        <p className="text-2xl font-bold text-pink-600">
                          ₱{cake.basePrice}
                        </p>
                        <p className="text-xs text-gray-500">Starting price</p>
                      </div>
                      <div className="px-3 py-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-sm font-semibold rounded-lg shadow-md">
                        👁️ View Details
                      </div>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
