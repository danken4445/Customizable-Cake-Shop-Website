/*
 * ==============================================
 * 🎂 CAKE SHOP WEBSITE - ARCHITECTURE OVERVIEW
 * ==============================================
 */

/*
 * ┌─────────────────────────────────────────────────────────────┐
 * │                    USER JOURNEY FLOW                         │
 * └─────────────────────────────────────────────────────────────┘
 *
 * CUSTOMER PATH:
 * ──────────────
 *
 *  1. Landing Page (/)
 *      ↓
 *      Lists all cake shops from Firestore
 *      User clicks on a shop
 *      ↓
 *  2. Shop Showcase (/shop/:shopId)
 *      ↓
 *      Displays cakes for that shop
 *      User clicks "Customize" on a cake
 *      ↓
 *  3. Cake Customizer (/shop/:shopId/customize/:cakeId)
 *      ↓
 *      User selects:
 *        - Cake base (Chocolate, Vanilla, etc.)
 *        - Size (6", 8", 10")
 *        - Drags toppings onto cake
 *      Price updates in real-time
 *      Clicks "Add to Cart"
 *      ↓
 *  4. Shopping Cart (/cart)
 *      ↓
 *      Reviews order
 *      Clicks "Checkout"
 *      ↓
 *  5. Checkout (/checkout)
 *      ↓
 *      Enters details:
 *        - Name, contact, address
 *        - Pickup or delivery
 *      Submits order → Saved to Firestore
 *      ↓
 *  6. Order Confirmed!
 *      Returns to home page
 *
 *
 * ADMIN PATH:
 * ───────────
 *
 *  1. Admin Login (/admin/:shopId)
 *      ↓
 *      Shop owner enters email & password
 *      Firebase Authentication validates
 *      ↓
 *  2. Admin Dashboard
 *      ↓
 *      Views:
 *        - All orders for their shop
 *        - Total revenue
 *        - Order statistics
 *      Actions:
 *        - Update order status
 *        - (pending → preparing → ready → completed)
 */

/*
 * ┌─────────────────────────────────────────────────────────────┐
 * │                 FIREBASE DATA STRUCTURE                      │
 * └─────────────────────────────────────────────────────────────┘
 *
 * Firestore Database:
 * ──────────────────
 *
 * cakeShops/                           (Collection)
 * │
 * ├── shop1/                           (Document)
 * │   ├── name: "Sweet Treats"
 * │   ├── description: "..."
 * │   ├── logoUrl: "https://..."
 * │   ├── coverImageUrl: "https://..."
 * │   │
 * │   ├── cakes/                       (Subcollection)
 * │   │   ├── cake1/                   (Document)
 * │   │   │   ├── name: "Chocolate Cake"
 * │   │   │   ├── basePrice: 500
 * │   │   │   ├── imageUrl: "..."
 * │   │   │   └── description: "..."
 * │   │   │
 * │   │   └── cake2/
 * │   │       └── ...
 * │   │
 * │   ├── options/                     (Subcollection)
 * │   │   └── customizer/              (Document)
 * │   │       ├── bases: ["Chocolate", "Vanilla", ...]
 * │   │       ├── sizes: {"6-inch": 500, "8-inch": 700, ...}
 * │   │       └── toppings: [
 * │   │           {name: "Strawberry", price: 50, imageUrl: "..."},
 * │   │           ...
 * │   │         ]
 * │   │
 * │   └── orders/                      (Subcollection)
 * │       ├── order1/                  (Document)
 * │       │   ├── customerName: "Jane"
 * │       │   ├── contact: "09XX..."
 * │       │   ├── address: "..."
 * │       │   ├── pickup: false
 * │       │   ├── items: [...]
 * │       │   ├── totalPrice: 750
 * │       │   ├── status: "pending"
 * │       │   └── createdAt: "2025-..."
 * │       │
 * │       └── order2/
 * │           └── ...
 * │
 * └── shop2/
 *     └── (same structure as shop1)
 *
 *
 * Firebase Storage:
 * ────────────────
 *
 * /shops/
 *   ├── shop1/
 *   │   ├── logo.png
 *   │   ├── cover.jpg
 *   │   ├── cakes/
 *   │   │   ├── chocolate-cake.jpg
 *   │   │   └── vanilla-cake.jpg
 *   │   └── toppings/
 *   │       ├── strawberry.png
 *   │       └── cherry.png
 *   └── shop2/
 *       └── ...
 *
 *
 * Firebase Authentication:
 * ───────────────────────
 *
 * Users:
 *   ├── admin@shop1.com (Shop 1 owner)
 *   ├── admin@shop2.com (Shop 2 owner)
 *   └── ...
 */

/*
 * ┌─────────────────────────────────────────────────────────────┐
 * │                   COMPONENT HIERARCHY                        │
 * └─────────────────────────────────────────────────────────────┘
 *
 * App.jsx (Root)
 *   │
 *   ├── NextUIProvider
 *   │    └── CartProvider (Context)
 *   │         └── Router
 *   │              ├── Navbar
 *   │              │    └── Cart Badge (shows item count)
 *   │              │
 *   │              └── Routes
 *   │                   ├── Landing (/)
 *   │                   │    └── ShopCard × N
 *   │                   │
 *   │                   ├── ShopShowcase (/shop/:shopId)
 *   │                   │    └── CakeCard × N
 *   │                   │
 *   │                   ├── CustomizeCake (/shop/:shopId/customize/:cakeId)
 *   │                   │    ├── CakeCanvas (drop zone)
 *   │                   │    │    └── Placed toppings
 *   │                   │    └── ToppingItem × N (draggable)
 *   │                   │
 *   │                   ├── Cart (/cart)
 *   │                   │    └── Cart items list
 *   │                   │
 *   │                   ├── Checkout (/checkout)
 *   │                   │    └── Order form
 *   │                   │
 *   │                   └── AdminDashboard (/admin/:shopId)
 *   │                        ├── Login form (if not authenticated)
 *   │                        └── Orders table (if authenticated)
 */

/*
 * ┌─────────────────────────────────────────────────────────────┐
 * │                    DATA FLOW DIAGRAM                         │
 * └─────────────────────────────────────────────────────────────┘
 *
 * READING DATA (Customer browsing):
 * ─────────────────────────────────
 *
 *  React Component
 *       │
 *       │ useEffect() → Fetch data
 *       ↓
 *  Firebase SDK
 *       │
 *       │ getDocs() / getDoc()
 *       ↓
 *  Firestore Database
 *       │
 *       │ Returns data
 *       ↓
 *  React Component
 *       │
 *       │ setState()
 *       ↓
 *  UI Updates
 *
 *
 * WRITING DATA (Customer placing order):
 * ──────────────────────────────────────
 *
 *  Checkout Form
 *       │
 *       │ Submit button clicked
 *       ↓
 *  Cart Context
 *       │
 *       │ Get cart items
 *       ↓
 *  Firebase SDK
 *       │
 *       │ addDoc()
 *       ↓
 *  Firestore Database
 *       │
 *       │ Order saved
 *       ↓
 *  Success Message
 *       │
 *       │ Clear cart
 *       ↓
 *  Navigate to Home
 *
 *
 * DRAG & DROP (Customizing cake):
 * ───────────────────────────────
 *
 *  ToppingItem
 *       │
 *       │ useDrag() - User drags
 *       ↓
 *  CakeCanvas
 *       │
 *       │ useDrop() - Drop detected
 *       ↓
 *  Calculate position
 *       │
 *       │ Add to placedToppings[]
 *       ↓
 *  Re-render with new topping
 *       │
 *       │ Update total price
 *       ↓
 *  Display updated price
 */

/*
 * ┌─────────────────────────────────────────────────────────────┐
 * │                   STATE MANAGEMENT                           │
 * └─────────────────────────────────────────────────────────────┘
 *
 * GLOBAL STATE (Context API):
 * ──────────────────────────
 *
 *  CartContext
 *    ├── cartItems: []
 *    ├── addToCart()
 *    ├── removeFromCart()
 *    ├── clearCart()
 *    └── getTotalPrice()
 *
 *  Used by: All pages that need cart access
 *  Persisted in: localStorage
 *
 *
 * LOCAL STATE (Component State):
 * ─────────────────────────────
 *
 *  Landing.jsx
 *    ├── shops: []
 *    └── loading: false
 *
 *  ShopShowcase.jsx
 *    ├── shop: {}
 *    ├── cakes: []
 *    └── loading: false
 *
 *  CustomizeCake.jsx
 *    ├── shop: {}
 *    ├── cake: {}
 *    ├── options: {}
 *    ├── selectedBase: ""
 *    ├── selectedSize: ""
 *    ├── placedToppings: []
 *    └── loading: false
 *
 *  AdminDashboard.jsx
 *    ├── isAuthenticated: false
 *    ├── shop: {}
 *    ├── orders: []
 *    └── loading: false
 */

/*
 * ┌─────────────────────────────────────────────────────────────┐
 * │                    ROUTING STRUCTURE                         │
 * └─────────────────────────────────────────────────────────────┘
 *
 *  Path                                    Component
 *  ────────────────────────────────────    ─────────────────────
 *  /                                       Landing
 *  /shop/:shopId                           ShopShowcase
 *  /shop/:shopId/customize/:cakeId         CustomizeCake
 *  /cart                                   Cart
 *  /checkout                               Checkout
 *  /admin/:shopId                          AdminDashboard
 *
 *
 *  Example URLs:
 *  ────────────
 *  http://localhost:5173/
 *  http://localhost:5173/shop/shop1
 *  http://localhost:5173/shop/shop1/customize/cake1
 *  http://localhost:5173/cart
 *  http://localhost:5173/checkout
 *  http://localhost:5173/admin/shop1
 */

/*
 * ┌─────────────────────────────────────────────────────────────┐
 * │                  SECURITY & PERMISSIONS                      │
 * └─────────────────────────────────────────────────────────────┘
 *
 * PUBLIC (No auth required):
 *   ✅ Browse shops
 *   ✅ View cakes
 *   ✅ Customize cakes
 *   ✅ Add to cart
 *   ✅ Checkout (creates order)
 *
 * AUTHENTICATED (Shop owners only):
 *   🔒 View orders
 *   🔒 Update order status
 *   🔒 Upload images (future)
 *   🔒 Edit shop info (future)
 *
 * Firestore Rules:
 *   - Read: Anyone
 *   - Write orders: Anyone (for new orders)
 *   - Update orders: Authenticated users only
 */

/*
 * ┌─────────────────────────────────────────────────────────────┐
 * │                    DEPENDENCIES USED                         │
 * └─────────────────────────────────────────────────────────────┘
 *
 * Core:
 *   • react               - UI framework
 *   • react-dom           - DOM rendering
 *   • react-router-dom    - Client-side routing
 *
 * UI:
 *   • @nextui-org/react   - Component library
 *   • tailwindcss         - Utility CSS
 *   • framer-motion       - Animations (for Next UI)
 *
 * Backend:
 *   • firebase            - Firestore, Storage, Auth
 *
 * Features:
 *   • react-dnd           - Drag and drop
 *   • react-dnd-html5-backend - HTML5 drag backend
 *
 * Build:
 *   • vite                - Build tool
 *   • @vitejs/plugin-react - React support for Vite
 */

/*
 * ┌─────────────────────────────────────────────────────────────┐
 * │                   KEY FEATURES RECAP                         │
 * └─────────────────────────────────────────────────────────────┘
 *
 * ✅ Multi-shop support
 * ✅ Dynamic cake customization
 * ✅ Drag-and-drop toppings
 * ✅ Real-time price calculation
 * ✅ Shopping cart with persistence
 * ✅ Order placement and tracking
 * ✅ Admin dashboard
 * ✅ Order status management
 * ✅ Responsive design
 * ✅ Firebase integration
 * ✅ Image storage
 * ✅ User authentication (admin)
 */

// End of Architecture Overview
