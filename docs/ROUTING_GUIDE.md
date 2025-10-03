# Multi-Tenant Routing Guide

This document explains the routing structure for the multi-tenant cake shop platform.

## Route Structure

### Global Routes (Platform-level)

#### `/` - Welcome/Home Page
- **Purpose**: Platform landing page with overview
- **Features**:
  - Platform introduction
  - Quick links to create shop or access dashboard
  - Feature highlights
  - Demo shop link
- **Access**: Public
- **Component**: `src/pages/Welcome.jsx`

#### `/onboarding` - Shop Onboarding
- **Purpose**: Create a new cake shop
- **Features**:
  - Shop information form (name, slug, description)
  - Owner details (name, email, phone, address)
  - Branding options (colors, logo, cover image)
  - Auto-generates shop with default settings
  - Creates sample cake and customizer options
- **Access**: Public
- **Component**: `src/pages/Onboarding.jsx`

#### `/dashboard` - Admin Dashboard
- **Purpose**: Manage shop operations
- **Features**:
  - View all orders
  - Manage cakes
  - Update shop settings
  - Requires Firebase Authentication
- **Access**: Protected (requires login)
- **Component**: `src/pages/AdminDashboard.jsx`

---

### Shop-Specific Routes (Tenant-level)

All shop routes follow the pattern: `/shop/:shopId/...`

#### `/shop/:shopId` - Customer Storefront
- **Purpose**: Main landing page for a specific shop
- **Features**:
  - Displays shop branding (logo, cover image, colors)
  - Shows available cakes in grid layout
  - Click cake to navigate to customizer
- **Access**: Public
- **Component**: `src/pages/Landing.jsx`
- **Example**: `/shop/sweet-dreams-bakery`

#### `/shop/:shopId/customize/:cakeId` - Cake Customization
- **Purpose**: Customize a selected cake
- **Features**:
  - Drag-and-drop topping placement
  - Select cake base and size
  - Real-time price calculation
  - Add to cart functionality
- **Access**: Public
- **Component**: `src/pages/CustomizeCake.jsx`
- **Example**: `/shop/sweet-dreams-bakery/customize/cake123`

#### `/shop/:shopId/cart` - Shopping Cart
- **Purpose**: Review items before checkout
- **Features**:
  - View all cart items
  - Remove items
  - See total price
  - Proceed to checkout
- **Access**: Public
- **Component**: `src/pages/Cart.jsx`
- **Example**: `/shop/sweet-dreams-bakery/cart`

#### `/shop/:shopId/checkout` - Checkout Page
- **Purpose**: Complete order placement
- **Features**:
  - Customer information form
  - Delivery/pickup selection
  - Order summary
  - Submit order to Firestore
  - Redirects to order tracking on success
- **Access**: Public
- **Component**: `src/pages/Checkout.jsx`
- **Example**: `/shop/sweet-dreams-bakery/checkout`

#### `/shop/:shopId/track/:orderId` - Order Tracking
- **Purpose**: Track order status
- **Features**:
  - Order status with progress bar
  - Order item details
  - Customer information
  - Estimated ready time
  - Contact shop details
- **Access**: Public
- **Component**: `src/pages/OrderTracking.jsx`
- **Example**: `/shop/sweet-dreams-bakery/track/order456`

---

## Technical Implementation

### Shop ID Extraction

The `ShopContext` automatically extracts the `shopId` from the URL path:

```javascript
// In ShopContext.jsx
const pathSegments = location.pathname.split("/").filter(Boolean);
if (pathSegments.length >= 2 && pathSegments[0] === "shop") {
  currentShopId = pathSegments[1];
}
```

### Route Helper Utilities

Located in `src/utils/shopUtils.js`:

```javascript
// Get shop ID from URL
export const getShopId = () => {
  const pathname = window.location.pathname;
  const pathSegments = pathname.split("/").filter(Boolean);
  
  if (pathSegments.length >= 2 && pathSegments[0] === "shop") {
    return pathSegments[1];
  }
  return null;
};

// Build route path with shop prefix
export const getRoutePath = (path, shopId) => {
  const cleanPath = path.startsWith("/") ? path.substring(1) : path;
  return `/shop/${shopId}/${cleanPath}`;
};
```

### Navigation Examples

```javascript
// In React components:
import { getRoutePath } from "../utils/shopUtils";
import { useShop } from "../context/ShopContext";

const { shopId } = useShop();

// Navigate to shop home
navigate(getRoutePath("", shopId));
// Result: /shop/sweet-dreams-bakery

// Navigate to customize page
navigate(getRoutePath(`customize/${cakeId}`, shopId));
// Result: /shop/sweet-dreams-bakery/customize/cake123

// Navigate to cart
navigate(getRoutePath("cart", shopId));
// Result: /shop/sweet-dreams-bakery/cart
```

---

## Firestore Data Structure

### Shop Document
**Path**: `cakeShops/{shopId}`

```javascript
{
  name: "Sweet Dreams Bakery",
  slug: "sweet-dreams-bakery",
  ownerName: "John Doe",
  ownerEmail: "john@example.com",
  phone: "+1234567890",
  address: "123 Main St",
  description: "Best cakes in town",
  logo: "https://...",
  coverImage: "https://...",
  primaryColor: "#ec4899",
  secondaryColor: "#a855f7",
  createdAt: "2025-10-03T...",
  isActive: true
}
```

### Cakes Subcollection
**Path**: `cakeShops/{shopId}/cakes/{cakeId}`

```javascript
{
  name: "Classic Vanilla Delight",
  description: "A timeless vanilla cake",
  basePrice: 35,
  image: "https://...",
  category: "Classic",
  isAvailable: true,
  createdAt: "2025-10-03T..."
}
```

### Customizer Options
**Path**: `cakeShops/{shopId}/options/customizer`

```javascript
{
  bases: [
    { id: 1, name: "Vanilla", price: 0 },
    { id: 2, name: "Chocolate", price: 5 }
  ],
  sizes: [
    { id: 1, name: "Small (6 inch)", price: 25 },
    { id: 2, name: "Medium (8 inch)", price: 40 }
  ],
  toppings: [
    { id: 1, name: "Strawberries", price: 5, emoji: "🍓" }
  ]
}
```

### Orders Subcollection
**Path**: `cakeShops/{shopId}/orders/{orderId}`

```javascript
{
  customerName: "Jane Smith",
  customerEmail: "jane@example.com",
  customerPhone: "+1234567890",
  deliveryNotes: "Leave at door",
  items: [
    {
      cakeName: "Classic Vanilla Delight",
      selectedBase: "Chocolate",
      selectedSize: "Medium (8 inch)",
      placedToppings: [
        { id: 1, name: "Strawberries" }
      ],
      totalPrice: 50
    }
  ],
  totalAmount: 50,
  status: "pending", // pending | confirmed | preparing | ready | completed | cancelled
  createdAt: "2025-10-03T...",
  estimatedReadyTime: "2025-10-04T..."
}
```

---

## User Flows

### Shop Owner Flow
1. Visit `/onboarding`
2. Fill out shop creation form
3. Submit to create shop in Firestore
4. Redirected to `/shop/{shopId}` (their new storefront)
5. Access `/dashboard` to manage shop

### Customer Flow
1. Visit `/shop/{shopId}` (shop landing page)
2. Browse available cakes
3. Click cake → `/shop/{shopId}/customize/{cakeId}`
4. Customize cake with toppings, size, base
5. Add to cart → `/shop/{shopId}/cart`
6. Review cart items
7. Proceed to checkout → `/shop/{shopId}/checkout`
8. Fill in delivery info and submit order
9. Redirected to `/shop/{shopId}/track/{orderId}`
10. Track order status

---

## Development Tips

### Testing Multiple Shops

```bash
# Create shops via onboarding:
http://localhost:5173/onboarding

# Then visit different shops:
http://localhost:5173/shop/shop-a
http://localhost:5173/shop/shop-b
http://localhost:5173/shop/shop-c
```

### Navbar Behavior

- **On shop pages** (`/shop/:shopId/*`):
  - Shows shop name in brand
  - Displays cart badge
  - "Shop Home" link visible

- **On platform pages** (`/onboarding`, `/dashboard`):
  - Shows "Multi-Shop Platform" in brand
  - No cart badge
  - "Create Shop" and "Dashboard" links visible

### Adding New Shop Routes

1. Add route in `App.jsx`:
   ```jsx
   <Route path="/shop/:shopId/new-page" element={<NewPage />} />
   ```

2. Use `useShop` hook to get shopId:
   ```jsx
   const { shopId } = useShop();
   ```

3. Navigate using helper:
   ```jsx
   navigate(getRoutePath("new-page", shopId));
   ```

---

## Migration Notes

### From Old Routing (Subdomain/Path)

**Old approach:**
- Development: `/:shopId/customize/:cakeId`
- Production: subdomain-based routing

**New approach:**
- Unified: `/shop/:shopId/customize/:cakeId`
- Works everywhere (development & production)

### Updated Files

- `src/App.jsx` - New route definitions
- `src/utils/shopUtils.js` - Simplified helpers
- `src/context/ShopContext.jsx` - URL-based shop detection
- `src/components/Navbar.jsx` - Adaptive navigation
- `src/pages/Onboarding.jsx` - New shop creation
- `src/pages/OrderTracking.jsx` - New tracking page
- `src/pages/Checkout.jsx` - Updated to redirect to tracking

---

## Future Enhancements

- [ ] Shop selection/browse page at `/shops`
- [ ] Public shop profiles at `/shop/:shopId/about`
- [ ] Customer accounts with order history
- [ ] Shop analytics dashboard
- [ ] Multi-language support per shop
- [ ] Custom domain mapping
