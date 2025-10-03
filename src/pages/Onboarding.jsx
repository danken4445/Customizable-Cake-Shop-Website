import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc, doc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../services/firebase";
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Button,
  Divider,
} from "@nextui-org/react";

function Onboarding() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    shopName: "",
    shopSlug: "",
    ownerName: "",
    ownerEmail: "",
    phone: "",
    address: "",
    description: "",
    primaryColor: "#ec4899",
    secondaryColor: "#a855f7",
  });
  const [logoFile, setLogoFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Auto-generate slug from shop name
    if (field === "shopName") {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setFormData((prev) => ({ ...prev, shopSlug: slug }));
    }
  };

  const handleFileChange = (field, file) => {
    if (field === "logo") setLogoFile(file);
    if (field === "cover") setCoverFile(file);
  };

  const uploadImage = async (file, path) => {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const shopId = formData.shopSlug || `shop-${Date.now()}`;

      // Upload images if provided
      let logoUrl = "";
      let coverUrl = "";

      if (logoFile) {
        try {
          logoUrl = await uploadImage(logoFile, `shops/${shopId}/logo.jpg`);
        } catch (error) {
          console.error("Error uploading logo:", error);
          alert(
            "Warning: Logo upload failed. The shop will be created without a logo. \n\nError: " +
              error.message +
              "\n\nPlease check Firebase Storage rules."
          );
        }
      }

      if (coverFile) {
        try {
          coverUrl = await uploadImage(coverFile, `shops/${shopId}/cover.jpg`);
        } catch (error) {
          console.error("Error uploading cover:", error);
          alert(
            "Warning: Cover image upload failed. The shop will be created without a cover image. \n\nError: " +
              error.message +
              "\n\nPlease check Firebase Storage rules."
          );
        }
      }

      // Create shop document
      const shopData = {
        name: formData.shopName,
        slug: shopId,
        ownerName: formData.ownerName,
        ownerEmail: formData.ownerEmail,
        phone: formData.phone,
        address: formData.address,
        description: formData.description,
        logo: logoUrl,
        coverImage: coverUrl,
        primaryColor: formData.primaryColor,
        secondaryColor: formData.secondaryColor,
        createdAt: new Date().toISOString(),
        isActive: true,
      };

      // Create shop in Firestore
      await setDoc(doc(db, "cakeShops", shopId), shopData);

      // Create default customizer options
      await setDoc(doc(db, "cakeShops", shopId, "options", "customizer"), {
        bases: [
          { id: 1, name: "Vanilla", price: 0 },
          { id: 2, name: "Chocolate", price: 5 },
          { id: 3, name: "Red Velvet", price: 8 },
          { id: 4, name: "Lemon", price: 6 },
        ],
        sizes: [
          { id: 1, name: "Small (6 inch)", price: 25 },
          { id: 2, name: "Medium (8 inch)", price: 40 },
          { id: 3, name: "Large (10 inch)", price: 60 },
        ],
        toppings: [
          { id: 1, name: "Strawberries", price: 5, emoji: "🍓" },
          { id: 2, name: "Chocolate Chips", price: 4, emoji: "🍫" },
          { id: 3, name: "Sprinkles", price: 2, emoji: "✨" },
          { id: 4, name: "Cherries", price: 3, emoji: "🍒" },
          { id: 5, name: "Whipped Cream", price: 6, emoji: "🍦" },
        ],
      });

      // Create a sample cake
      await addDoc(collection(db, "cakeShops", shopId, "cakes"), {
        name: "Classic Vanilla Delight",
        description: "A timeless vanilla cake with buttercream frosting",
        basePrice: 35,
        image: "https://images.unsplash.com/photo-1588195538326-c5b1e5b5c5b5",
        category: "Classic",
        isAvailable: true,
        createdAt: new Date().toISOString(),
      });

      alert(`Shop "${formData.shopName}" created successfully!`);
      navigate(`/shop/${shopId}`);
    } catch (error) {
      console.error("Error creating shop:", error);
      
      // Better error message
      let errorMessage = "Failed to create shop. ";
      
      if (error.code === "storage/unauthorized") {
        errorMessage += "\n\n⚠️ FIREBASE STORAGE PERMISSION ERROR\n\n";
        errorMessage += "Please update your Firebase Storage rules:\n\n";
        errorMessage += "1. Go to Firebase Console → Storage → Rules\n";
        errorMessage += "2. Add these rules:\n\n";
        errorMessage += "match /shops/{shopId}/{allPaths=**} {\n";
        errorMessage += "  allow read: if true;\n";
        errorMessage += "  allow write: if true;\n";
        errorMessage += "}\n\n";
        errorMessage += "3. Click Publish\n\n";
        errorMessage += "See docs/FIREBASE_STORAGE_RULES.md for details.";
      } else {
        errorMessage += error.message;
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Card className="shadow-xl">
          <CardHeader className="flex flex-col gap-2 px-6 pt-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              Create Your Cake Shop
            </h1>
            <p className="text-gray-600">
              Set up your branded online cake storefront in minutes
            </p>
          </CardHeader>
          <Divider />
          <CardBody className="px-6 py-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Shop Information */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  Shop Information
                </h2>
                <Input
                  label="Shop Name"
                  placeholder="e.g., Sweet Dreams Bakery"
                  value={formData.shopName}
                  onChange={(e) =>
                    handleInputChange("shopName", e.target.value)
                  }
                  isRequired
                  variant="bordered"
                />
                <Input
                  label="Shop URL Slug"
                  placeholder="sweet-dreams-bakery"
                  value={formData.shopSlug}
                  onChange={(e) =>
                    handleInputChange("shopSlug", e.target.value)
                  }
                  description="This will be your shop's unique URL"
                  isRequired
                  variant="bordered"
                />
                <Input
                  label="Description"
                  placeholder="Describe your shop..."
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  variant="bordered"
                />
              </div>

              {/* Owner Information */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  Owner Information
                </h2>
                <Input
                  label="Owner Name"
                  placeholder="John Doe"
                  value={formData.ownerName}
                  onChange={(e) =>
                    handleInputChange("ownerName", e.target.value)
                  }
                  isRequired
                  variant="bordered"
                />
                <Input
                  label="Email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.ownerEmail}
                  onChange={(e) =>
                    handleInputChange("ownerEmail", e.target.value)
                  }
                  isRequired
                  variant="bordered"
                />
                <Input
                  label="Phone"
                  type="tel"
                  placeholder="+1 234 567 8900"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  variant="bordered"
                />
                <Input
                  label="Address"
                  placeholder="123 Main St, City, State"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  variant="bordered"
                />
              </div>

              {/* Branding */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  Branding
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Primary Color
                    </label>
                    <input
                      type="color"
                      value={formData.primaryColor}
                      onChange={(e) =>
                        handleInputChange("primaryColor", e.target.value)
                      }
                      className="w-full h-12 rounded-lg border-2 border-gray-300 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Secondary Color
                    </label>
                    <input
                      type="color"
                      value={formData.secondaryColor}
                      onChange={(e) =>
                        handleInputChange("secondaryColor", e.target.value)
                      }
                      className="w-full h-12 rounded-lg border-2 border-gray-300 cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Shop Logo
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleFileChange("logo", e.target.files[0])
                    }
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Cover Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleFileChange("cover", e.target.files[0])
                    }
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                  />
                </div>
              </div>

              <Divider />

              <Button
                type="submit"
                color="primary"
                size="lg"
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 font-semibold"
                isLoading={loading}
              >
                {loading ? "Creating Shop..." : "Create Shop"}
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

export default Onboarding;
