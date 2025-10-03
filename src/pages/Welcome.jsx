import { useNavigate } from "react-router-dom";
import { Button, Card, CardBody } from "@nextui-org/react";

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-4xl w-full">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 bg-clip-text text-transparent">
            🎂 Multi-Tenant Cake Shop Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Create your branded online cake shop in minutes. Accept orders,
            customize cakes, and delight customers.
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Create Shop Card */}
          <Card className="hover:shadow-xl transition-shadow">
            <CardBody className="p-8">
              <div className="text-center">
                <div className="text-6xl mb-4">🏪</div>
                <h2 className="text-2xl font-bold mb-3 text-gray-800">
                  Create Your Shop
                </h2>
                <p className="text-gray-600 mb-4">
                  Set up your branded cake shop with custom colors, logo, and
                  menu. Start accepting orders today!
                </p>
                <Button
                  color="primary"
                  size="lg"
                  className="bg-gradient-to-r from-pink-500 to-purple-600"
                  onPress={() => navigate("/onboarding")}
                >
                  Get Started →
                </Button>
              </div>
            </CardBody>
          </Card>

          {/* Admin Dashboard Card */}
          <Card className="hover:shadow-xl transition-shadow">
            <CardBody className="p-8">
              <div className="text-center">
                <div className="text-6xl mb-4">⚙️</div>
                <h2 className="text-2xl font-bold mb-3 text-gray-800">
                  Admin Dashboard
                </h2>
                <p className="text-gray-600 mb-4">
                  Manage your shop, view orders, update inventory, and track
                  your business performance.
                </p>
                <Button
                  color="secondary"
                  size="lg"
                  className="bg-gradient-to-r from-purple-500 to-blue-600"
                  onPress={() => navigate("/admin/my-shops")}
                >
                  Go to Dashboard →
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Features Section */}
        <Card className="bg-white/80 backdrop-blur">
          <CardBody className="p-8">
            <h3 className="text-2xl font-bold text-center mb-6 text-gray-800">
              Platform Features
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl mb-2">🎨</div>
                <h4 className="font-semibold mb-2">Custom Branding</h4>
                <p className="text-sm text-gray-600">
                  Upload logos, choose colors, and create your unique brand
                  identity
                </p>
              </div>

              <div className="text-center">
                <div className="text-4xl mb-2">🎂</div>
                <h4 className="font-semibold mb-2">Cake Customizer</h4>
                <p className="text-sm text-gray-600">
                  Drag-and-drop interface for customers to design their perfect
                  cake
                </p>
              </div>

              <div className="text-center">
                <div className="text-4xl mb-2">📦</div>
                <h4 className="font-semibold mb-2">Order Tracking</h4>
                <p className="text-sm text-gray-600">
                  Real-time order status with progress tracking for customers
                </p>
              </div>

              <div className="text-center">
                <div className="text-4xl mb-2">🛒</div>
                <h4 className="font-semibold mb-2">Shopping Cart</h4>
                <p className="text-sm text-gray-600">
                  Multi-shop cart support with persistent storage
                </p>
              </div>

              <div className="text-center">
                <div className="text-4xl mb-2">🔥</div>
                <h4 className="font-semibold mb-2">Firebase Backend</h4>
                <p className="text-sm text-gray-600">
                  Secure, scalable infrastructure with real-time updates
                </p>
              </div>

              <div className="text-center">
                <div className="text-4xl mb-2">📱</div>
                <h4 className="font-semibold mb-2">Responsive Design</h4>
                <p className="text-sm text-gray-600">
                  Beautiful UI that works on desktop, tablet, and mobile
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Demo Shop Link */}
        <div className="text-center mt-8">
          <p className="text-gray-600 mb-4">
            Want to see a demo? Check out our sample shop:
          </p>
          <Button
            color="default"
            variant="bordered"
            onClick={() => navigate("/shop/demo-shop")}
          >
            Visit Demo Shop 🎂
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-sm text-gray-500">
          <p>
            Built with React, Next UI, Tailwind CSS, and Firebase
          </p>
          <p className="mt-2">
            Multi-tenant architecture • White-label solution • Open for
            customization
          </p>
        </div>
      </div>
    </div>
  );
}
