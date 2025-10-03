# System Architecture Diagram

## 🏗️ Application Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                            │
│                     (React + Next UI + Tailwind)                  │
└──────────────────────────────────────────────────────────────────┘
                                 │
                                 │
        ┌────────────────────────┼────────────────────────┐
        │                        │                        │
        ▼                        ▼                        ▼
┌──────────────┐        ┌──────────────┐        ┌──────────────┐
│   PLATFORM   │        │     SHOP     │        │    ADMIN     │
│    PAGES     │        │    PAGES     │        │   DASHBOARD  │
└──────────────┘        └──────────────┘        └──────────────┘
│                       │                       │
├─ Onboarding          ├─ Landing              └─ Dashboard
└─ (Create Shop)       ├─ CustomizeCake            (Protected)
                       ├─ Cart
                       ├─ Checkout
                       └─ OrderTracking
        │                        │                        │
        └────────────────────────┼────────────────────────┘
                                 │
                                 ▼
┌──────────────────────────────────────────────────────────────────┐
│                        CONTEXT LAYER                              │
│                      (State Management)                           │
├──────────────────────────────────────────────────────────────────┤
│  ShopContext         │  CartContext         │  Auth Context      │
│  - shop data         │  - cart items        │  - user session    │
│  - shopId            │  - add/remove        │  - admin status    │
│  - loading state     │  - total price       │                    │
└──────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌──────────────────────────────────────────────────────────────────┐
│                      FIREBASE SERVICES                            │
├──────────────────────────────────────────────────────────────────┤
│  Firestore           │  Storage             │  Authentication    │
│  - cakeShops/{id}    │  - shops/{id}/logo   │  - Admin login     │
│  - cakes             │  - shops/{id}/cover  │  - User sessions   │
│  - orders            │                      │                    │
│  - options           │                      │                    │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow Diagrams

### Shop Creation Flow

```
┌─────────────┐
│   User at   │
│ /onboarding │
└──────┬──────┘
       │
       │ Fills form
       │ Uploads images
       ▼
┌──────────────┐
│  Onboarding  │
│  Component   │
└──────┬───────┘
       │
       │ handleSubmit()
       ▼
┌──────────────┐       ┌──────────────┐
│   Upload     │──────▶│   Firebase   │
│   Images     │       │   Storage    │
└──────┬───────┘       └──────────────┘
       │
       │ Get URLs
       ▼
┌──────────────┐       ┌──────────────┐
│    Create    │──────▶│  Firestore   │
│ Shop Document│       │  cakeShops/  │
└──────┬───────┘       └──────────────┘
       │
       │ Create subcollections
       ▼
┌──────────────┐       ┌──────────────┐
│   Generate   │──────▶│  Firestore   │
│ Default Data │       │ cakes/options│
└──────┬───────┘       └──────────────┘
       │
       │ navigate()
       ▼
┌──────────────┐
│  /shop/{id}  │
│  (Storefront)│
└──────────────┘
```

### Customer Purchase Flow

```
┌─────────────┐
│   User at   │
│ /shop/{id}  │
└──────┬──────┘
       │
       │ Browse cakes
       │ Click cake
       ▼
┌───────────────────────┐
│  /shop/{id}/customize │
│      /{cakeId}        │
└──────┬────────────────┘
       │
       │ Customize cake
       │ Drag toppings
       │ Select options
       ▼
┌──────────────┐       ┌──────────────┐
│  Add to Cart │──────▶│ CartContext  │
│              │       │ (localStorage)│
└──────┬───────┘       └──────────────┘
       │
       │ navigate()
       ▼
┌──────────────┐
│ /shop/{id}/  │
│     cart     │
└──────┬───────┘
       │
       │ Review items
       │ Click checkout
       ▼
┌──────────────┐
│ /shop/{id}/  │
│   checkout   │
└──────┬───────┘
       │
       │ Fill form
       │ Submit order
       ▼
┌──────────────┐       ┌──────────────┐
│ Create Order │──────▶│  Firestore   │
│              │       │   orders/    │
└──────┬───────┘       └──────────────┘
       │
       │ Get orderId
       │ Clear cart
       │ navigate()
       ▼
┌──────────────┐
│ /shop/{id}/  │
│track/{order} │
└──────────────┘
```

### Order Tracking Flow

```
┌─────────────┐
│   User at   │
│/shop/{id}/  │
│track/{order}│
└──────┬──────┘
       │
       │ useParams()
       ▼
┌──────────────┐
│OrderTracking │
│  Component   │
└──────┬───────┘
       │
       │ Fetch shop data
       ▼
┌──────────────┐       ┌──────────────┐
│   getDoc()   │◀──────│  Firestore   │
│              │       │ cakeShops/   │
└──────┬───────┘       └──────────────┘
       │
       │ Fetch order data
       ▼
┌──────────────┐       ┌──────────────┐
│   getDoc()   │◀──────│  Firestore   │
│              │       │   orders/    │
└──────┬───────┘       └──────────────┘
       │
       │ Display status
       ▼
┌──────────────┐
│ Order Status │
│ Progress Bar │
│ Order Details│
└──────────────┘
```

---

## 🗺️ Component Hierarchy

```
App (NextUIProvider → ShopProvider → CartProvider → Router)
│
├─ Navbar
│  ├─ NavbarBrand (Shop name/logo)
│  ├─ NavbarContent (Navigation links)
│  └─ Cart Badge
│
└─ Routes
   │
   ├─ /onboarding
   │  └─ Onboarding
   │     ├─ Form inputs
   │     ├─ File uploads
   │     └─ Submit button
   │
   ├─ /dashboard
   │  └─ AdminDashboard
   │     ├─ Auth check
   │     ├─ Orders list
   │     └─ Shop settings
   │
   └─ /shop/:shopId
      │
      ├─ (root)
      │  └─ Landing
      │     ├─ Shop header
      │     ├─ Cover image
      │     └─ Cakes grid
      │        └─ CakeCard (multiple)
      │
      ├─ /customize/:cakeId
      │  └─ CustomizeCake
      │     ├─ DndProvider
      │     ├─ CakeCanvas
      │     │  └─ Placed toppings
      │     ├─ Options panel
      │     │  ├─ Base select
      │     │  ├─ Size select
      │     │  └─ Toppings grid
      │     │     └─ ToppingItem (multiple)
      │     └─ Price summary
      │
      ├─ /cart
      │  └─ Cart
      │     ├─ Cart items list
      │     ├─ Total price
      │     └─ Checkout button
      │
      ├─ /checkout
      │  └─ Checkout
      │     ├─ Customer form
      │     ├─ Delivery options
      │     └─ Submit button
      │
      └─ /track/:orderId
         └─ OrderTracking
            ├─ Order status
            ├─ Progress bar
            ├─ Items list
            └─ Contact info
```

---

## 🔐 Security Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                      SECURITY LAYERS                              │
└──────────────────────────────────────────────────────────────────┘

Public Access (No Auth Required)
├─ /onboarding                    → Create shop
├─ /shop/:shopId                  → View shop
├─ /shop/:shopId/customize/:id    → Customize cake
├─ /shop/:shopId/cart             → View cart
├─ /shop/:shopId/checkout         → Place order
└─ /shop/:shopId/track/:orderId   → Track order

Protected Access (Auth Required)
└─ /dashboard                     → Admin panel
   └─ Firebase Auth check
      └─ onAuthStateChanged()

Firestore Security Rules
├─ cakeShops/{shopId}
│  ├─ read: public              ✅
│  └─ write: authenticated      🔒
│
├─ cakes/{cakeId}
│  ├─ read: public              ✅
│  └─ write: authenticated      🔒
│
├─ orders/{orderId}
│  ├─ read: public              ✅
│  ├─ create: public            ✅
│  └─ update/delete: auth       🔒
│
└─ options/{optionId}
   ├─ read: public              ✅
   └─ write: authenticated      🔒

Storage Security Rules
└─ shops/{shopId}/*
   ├─ read: public              ✅
   └─ write: authenticated      🔒
```

---

## 🌐 Routing Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                    URL STRUCTURE                                  │
└──────────────────────────────────────────────────────────────────┘

Platform Routes
├─ /onboarding
│  └─ Purpose: Create new shop
│  └─ Access: Public
│  └─ Component: Onboarding.jsx
│
└─ /dashboard
   └─ Purpose: Shop management
   └─ Access: Protected (Firebase Auth)
   └─ Component: AdminDashboard.jsx

Shop Routes (Multi-tenant)
/shop/:shopId/
├─ (root)
│  └─ Purpose: Shop storefront
│  └─ Access: Public
│  └─ Component: Landing.jsx
│
├─ customize/:cakeId
│  └─ Purpose: Cake customization
│  └─ Access: Public
│  └─ Component: CustomizeCake.jsx
│
├─ cart
│  └─ Purpose: Shopping cart
│  └─ Access: Public
│  └─ Component: Cart.jsx
│
├─ checkout
│  └─ Purpose: Order placement
│  └─ Access: Public
│  └─ Component: Checkout.jsx
│
└─ track/:orderId
   └─ Purpose: Order tracking
   └─ Access: Public
   └─ Component: OrderTracking.jsx

┌──────────────────────────────────────────────────────────────────┐
│                    ROUTE HELPERS                                  │
└──────────────────────────────────────────────────────────────────┘

getShopId()
├─ Extracts shopId from URL
├─ Parses: /shop/:shopId/...
└─ Returns: shopId or null

getRoutePath(path, shopId)
├─ Builds shop-prefixed routes
├─ Input: ("cart", "my-shop")
└─ Output: "/shop/my-shop/cart"

ShopContext
├─ Monitors URL changes (useLocation)
├─ Fetches shop data from Firestore
├─ Provides: { shop, shopId, loading, error }
└─ Used by: All shop pages
```

---

## 📊 State Management

```
┌──────────────────────────────────────────────────────────────────┐
│                    CONTEXT PROVIDERS                              │
└──────────────────────────────────────────────────────────────────┘

ShopContext
├─ State:
│  ├─ shop: { name, logo, colors, ... }
│  ├─ shopId: "my-shop"
│  ├─ loading: boolean
│  └─ error: string | null
│
├─ Data Source: Firestore (cakeShops/{shopId})
├─ Update Trigger: URL change (useLocation)
└─ Used By: All shop pages

CartContext
├─ State:
│  └─ cartItems: [{ cakeName, shopId, price, ... }]
│
├─ Methods:
│  ├─ addToCart(item)
│  ├─ removeFromCart(itemId)
│  ├─ clearCart()
│  └─ getTotalPrice()
│
├─ Persistence: localStorage ("cakeCart")
└─ Used By: Landing, CustomizeCake, Cart, Checkout

AuthContext (Implicit - Firebase)
├─ State:
│  └─ currentUser: User | null
│
├─ Methods:
│  ├─ signInWithEmailAndPassword()
│  └─ signOut()
│
└─ Used By: AdminDashboard
```

---

## 🚀 Deployment Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                    DEPLOYMENT OPTIONS                             │
└──────────────────────────────────────────────────────────────────┘

Option 1: Vercel
├─ Build Command: npm run build
├─ Output Directory: dist
├─ Environment: Node.js 18+
└─ Auto HTTPS ✅

Option 2: Netlify
├─ Build Command: npm run build
├─ Publish Directory: dist
├─ Redirects: _redirects file
└─ Auto HTTPS ✅

Option 3: Firebase Hosting
├─ Build Command: npm run build
├─ Public Directory: dist
├─ Rewrite: Single-page app
└─ Integrated with Firestore ✅

┌──────────────────────────────────────────────────────────────────┐
│                    BUILD PROCESS                                  │
└──────────────────────────────────────────────────────────────────┘

npm run build
    │
    ├─ Vite bundles React app
    ├─ Tailwind processes CSS
    ├─ Next UI components bundled
    ├─ Code splitting enabled
    └─ Output: dist/
       ├─ index.html
       ├─ assets/
       │  ├─ index-[hash].js
       │  └─ index-[hash].css
       └─ vite.svg
```

This visual architecture helps understand how all the pieces fit together!
