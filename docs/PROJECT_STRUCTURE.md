# Project Structure Overview

## 📁 Directory Structure

```
Customizable-Cake-Shop-Website/
│
├── docs/                           # Documentation
│   ├── ROUTING_GUIDE.md           # Complete routing documentation
│   ├── QUICK_REFERENCE.md         # Quick reference guide
│   ├── FIREBASE_SETUP.md          # Firebase setup guide
│   └── ...other docs
│
├── public/                         # Static assets
│   └── vite.svg
│
├── src/                            # Source code
│   ├── assets/                    # Images, icons
│   │   └── react.svg
│   │
│   ├── components/                # Reusable UI components
│   │   ├── CakeCanvas.jsx        # Drag-drop cake canvas
│   │   ├── CakeCard.jsx          # Cake display card
│   │   ├── Navbar.jsx            # Navigation bar
│   │   ├── ShopCard.jsx          # Shop card display
│   │   └── ToppingItem.jsx       # Draggable topping
│   │
│   ├── context/                   # React Context providers
│   │   ├── CartContext.jsx       # Shopping cart state
│   │   └── ShopContext.jsx       # Shop data & routing
│   │
│   ├── pages/                     # Route pages
│   │   ├── Onboarding.jsx        # ✨ NEW: Shop creation
│   │   ├── OrderTracking.jsx     # ✨ NEW: Order tracking
│   │   ├── AdminDashboard.jsx    # Admin panel
│   │   ├── Cart.jsx              # Shopping cart
│   │   ├── Checkout.jsx          # Order checkout
│   │   ├── CustomizeCake.jsx     # Cake customizer
│   │   ├── Landing.jsx           # Shop storefront
│   │   └── ShopShowcase.jsx      # Shop gallery (unused)
│   │
│   ├── services/                  # External services
│   │   └── firebase.js           # Firebase config
│   │
│   ├── utils/                     # Helper functions
│   │   └── shopUtils.js          # 🔄 UPDATED: Route helpers
│   │
│   ├── App.jsx                    # 🔄 UPDATED: Main app & routes
│   ├── main.jsx                   # App entry point
│   ├── App.css                    # App styles
│   └── index.css                  # Global styles
│
├── index.html                     # HTML template
├── package.json                   # Dependencies
├── vite.config.js                 # Vite configuration
├── tailwind.config.js             # Tailwind CSS config
├── postcss.config.js              # PostCSS config
└── README.md                      # This file
```

## 🆕 New Files Added

1. **`src/pages/Onboarding.jsx`**
   - Shop creation form
   - Image upload for logo/cover
   - Branding customization
   - Auto-generates default data

2. **`src/pages/OrderTracking.jsx`**
   - Order status display
   - Progress visualization
   - Customer order details
   - Contact information

3. **`docs/ROUTING_GUIDE.md`**
   - Complete routing documentation
   - Firestore structure
   - User flows
   - Development tips

4. **`docs/QUICK_REFERENCE.md`**
   - Quick reference for routes
   - Code snippets
   - Common patterns

## 🔄 Updated Files

1. **`src/App.jsx`**
   - New route structure: `/shop/:shopId/*`
   - Added `/onboarding` route
   - Added `/dashboard` route
   - Added `/shop/:shopId/track/:orderId` route

2. **`src/utils/shopUtils.js`**
   - Simplified `getShopId()` - extracts from `/shop/:shopId` path
   - Updated `getRoutePath()` - builds routes with shop prefix

3. **`src/context/ShopContext.jsx`**
   - Now uses `useLocation` to track route changes
   - Extracts shopId from URL path
   - Handles routes without shopId (onboarding, dashboard)

4. **`src/components/Navbar.jsx`**
   - Adaptive navigation (shop vs platform pages)
   - Dropdown menu for global navigation
   - Conditional cart display

5. **`src/pages/Checkout.jsx`**
   - Redirects to order tracking after successful order
   - Improved order data structure
   - Shows tracking links in success message

## 📋 Route Reference

### Platform Routes
- `/onboarding` - Create new shop
- `/dashboard` - Admin dashboard

### Shop Routes
- `/shop/:shopId` - Shop storefront
- `/shop/:shopId/customize/:cakeId` - Customize cake
- `/shop/:shopId/cart` - Shopping cart
- `/shop/:shopId/checkout` - Checkout
- `/shop/:shopId/track/:orderId` - Track order

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Create a new shop
# Visit: http://localhost:5173/onboarding

# View a shop (replace 'my-shop' with your shop slug)
# Visit: http://localhost:5173/shop/my-shop
```

## 🔧 Technology Stack

- **React** 19.1.1 - UI framework
- **Vite** 7.1.7 - Build tool
- **React Router** 7.9.3 - Routing
- **Firebase** 12.3.0 - Backend (Firestore, Storage, Auth)
- **Next UI** 2.6.11 - Component library
- **Tailwind CSS** 3.4.18 - Styling
- **React DnD** 16.0.1 - Drag and drop
- **Framer Motion** 12.23.22 - Animations

## 📦 Key Dependencies

```json
{
  "dependencies": {
    "@nextui-org/react": "^2.6.11",
    "firebase": "^12.3.0",
    "framer-motion": "^12.23.22",
    "react": "^19.1.1",
    "react-dnd": "^16.0.1",
    "react-dnd-html5-backend": "^16.0.1",
    "react-dom": "^19.1.1",
    "react-router-dom": "^7.9.3"
  }
}
```

## 🎯 Core Features

### Multi-Tenancy
- Each shop has unique ID and branding
- Isolated data (cakes, orders, settings)
- Shared platform infrastructure

### Shop Management
- Onboarding flow for new shops
- Admin dashboard for shop owners
- Customizable branding (colors, logos, images)

### Customer Experience
- Browse shop's cakes
- Drag-drop cake customization
- Shopping cart with multi-shop support
- Order tracking with status updates

### Firebase Integration
- Firestore for data storage
- Storage for image uploads
- Auth for admin access

## 🎨 Customization

### Shop Branding
Shops can customize:
- Primary & secondary colors
- Logo image
- Cover/hero image
- Shop name & description

### Cake Options
Each shop can configure:
- Cake bases (vanilla, chocolate, etc.)
- Sizes (small, medium, large)
- Toppings with prices and emojis

## 📚 Documentation

- **[ROUTING_GUIDE.md](docs/ROUTING_GUIDE.md)** - Complete routing documentation
- **[QUICK_REFERENCE.md](docs/QUICK_REFERENCE.md)** - Quick reference guide
- **[FIREBASE_SETUP.md](docs/FIREBASE_SETUP.md)** - Firebase configuration
- **[DEPLOYMENT.md](docs/DEPLOYMENT.md)** - Deployment instructions

## 🐛 Debugging Tips

### Shop Not Loading?
1. Check console for errors
2. Verify shopId in URL
3. Check Firestore for shop document

### Cart Not Working?
1. Check localStorage (key: `"cakeCart"`)
2. Verify CartContext is wrapping routes
3. Check shopId in cart items

### Routes Not Working?
1. Clear browser cache
2. Check `getRoutePath()` usage
3. Verify App.jsx route definitions

## 📝 License

This project is part of a learning/development initiative.

## 🤝 Contributing

This is a custom project. For modifications:
1. Follow existing code patterns
2. Update documentation
3. Test all routes thoroughly
4. Maintain Firebase structure
