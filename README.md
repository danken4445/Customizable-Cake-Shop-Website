# 🎂 Multi-Tenant Cake Shop Platform

A white-label cake customization and ordering platform built with React, Next UI, Tailwind CSS, and Firebase. Each shop gets their own branded storefront with custom cakes, drag-and-drop customization, and order tracking.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Create your first shop
# Visit: http://localhost:5173/onboarding
```

**[📖 See Full Quick Start Guide →](docs/QUICK_START.md)**

---

## ✨ Features

- 🏪 **Multi-Tenancy**: Each shop has unique URL, branding, and isolated data
- 🎨 **Custom Branding**: Logos, colors, and cover images per shop
- 🎂 **Drag-Drop Customization**: Interactive cake builder with toppings
- 🛒 **Shopping Cart**: Multi-shop cart with localStorage persistence
- 📦 **Order Tracking**: Real-time status with progress visualization
- 🔐 **Admin Dashboard**: Protected shop management panel
- 🔥 **Firebase Backend**: Firestore, Storage, and Authentication

---

## 📋 Route Structure

```
Platform Routes (Global)
├─ /onboarding          → Shop creation form
└─ /dashboard           → Admin dashboard (protected)

Shop Routes (Per-Tenant)
/shop/:shopId/
├─ (root)               → Shop storefront
├─ customize/:cakeId    → Cake customizer
├─ cart                 → Shopping cart
├─ checkout             → Order checkout
└─ track/:orderId       → Order tracking
```

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.1.1 | UI framework |
| React Router | 7.9.3 | Routing |
| Vite | 7.1.7 | Build tool |
| Firebase | 12.3.0 | Backend services |
| Next UI | 2.6.11 | Component library |
| Tailwind CSS | 3.4.18 | Styling |
| React DnD | 16.0.1 | Drag and drop |

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| **[Quick Start Guide](docs/QUICK_START.md)** | Get running in 5 minutes |
| **[Implementation Summary](docs/IMPLEMENTATION_SUMMARY.md)** | Complete overview of features |
| **[Project Structure](docs/PROJECT_STRUCTURE.md)** | Directory structure & tech stack |
| **[Routing Guide](docs/ROUTING_GUIDE.md)** | Detailed routing documentation |
| **[Quick Reference](docs/QUICK_REFERENCE.md)** | Developer code snippets |
| **[Migration Checklist](docs/MIGRATION_CHECKLIST.md)** | Testing & deployment guide |
| **[Firebase Setup](docs/FIREBASE_SETUP.md)** | Firebase configuration |

---

## 🎯 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Navbar.jsx      # Navigation bar
│   ├── CakeCanvas.jsx  # Drag-drop canvas
│   └── ...
├── context/            # React Context providers
│   ├── ShopContext.jsx # Shop data & routing
│   └── CartContext.jsx # Shopping cart state
├── pages/              # Route pages
│   ├── Onboarding.jsx  # Shop creation
│   ├── Landing.jsx     # Shop storefront
│   ├── CustomizeCake.jsx # Cake customizer
│   ├── OrderTracking.jsx # Order tracking
│   └── ...
├── services/           # External services
│   └── firebase.js     # Firebase config
└── utils/              # Helper functions
    └── shopUtils.js    # Route helpers
```

---

## 🔥 Firebase Structure

```
Firestore:
└─ cakeShops/{shopId}/
   ├─ (shop document)
   ├─ cakes/{cakeId}/
   ├─ options/customizer/
   └─ orders/{orderId}/

Storage:
└─ shops/{shopId}/
   ├─ logo.jpg
   └─ cover.jpg
```

---

## 🎨 Usage Example

### Create a Shop
```javascript
// Visit /onboarding
// Fill form → Shop created in Firestore
// Redirect to /shop/your-shop-slug
```

### Customize Navigation
```javascript
import { useShop } from "../context/ShopContext";
import { getRoutePath } from "../utils/shopUtils";

const { shopId } = useShop();
const navigate = useNavigate();

// Navigate to cart
navigate(getRoutePath("cart", shopId));
// Result: /shop/your-shop-slug/cart
```

### Access Shop Data
```javascript
import { useShop } from "../context/ShopContext";

function MyComponent() {
  const { shop, shopId, loading, error } = useShop();
  
  return <h1>{shop.name}</h1>;
}
```

---

## 🧪 Development

```bash
# Install dependencies
npm install

# Start dev server (port 5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 🚀 Deployment

Follow the **[Migration Checklist](docs/MIGRATION_CHECKLIST.md)** for complete deployment instructions.

**Supported Platforms:**
- Vercel
- Netlify
- Firebase Hosting

---

## 📖 Learn More

- **[Quick Start Guide](docs/QUICK_START.md)** - Get started in 5 minutes
- **[Routing Guide](docs/ROUTING_GUIDE.md)** - Complete routing documentation
- **[Quick Reference](docs/QUICK_REFERENCE.md)** - Developer quick reference

---

## 📝 License

This project is part of a learning/development initiative.

---

## 🤝 Contributing

This is a custom project. For modifications:
1. Follow existing code patterns
2. Update documentation
3. Test all routes thoroughly
4. Maintain Firebase structure

---

**Built with ❤️ using React, Next UI, and Firebase**