# Quick Reference: Multi-Tenant Routes

## Route Map

```
Platform Routes (Global)
│
├─ /                    → Welcome/home page
├─ /onboarding          → Shop creation form
└─ /dashboard           → Admin dashboard (protected)

Shop Routes (Per-Tenant)
│
/shop/:shopId/
├─ (root)               → Shop storefront/landing
├─ customize/:cakeId    → Cake customizer
├─ cart                 → Shopping cart
├─ checkout             → Order checkout
└─ track/:orderId       → Order tracking
```

## Navigation Helpers

### Get Shop ID
```javascript
import { useShop } from "../context/ShopContext";
const { shopId } = useShop();
```

### Build Route Paths
```javascript
import { getRoutePath } from "../utils/shopUtils";

// Examples:
getRoutePath("", shopId)                    // /shop/shop-a
getRoutePath("customize/cake1", shopId)      // /shop/shop-a/customize/cake1
getRoutePath("cart", shopId)                 // /shop/shop-a/cart
```

## Common Patterns

### Page Component Template
```javascript
import { useShop } from "../context/ShopContext";
import { useNavigate } from "react-router-dom";
import { getRoutePath } from "../utils/shopUtils";

function MyPage() {
  const { shop, shopId, loading, error } = useShop();
  const navigate = useNavigate();
  
  // Navigate to shop home
  navigate(getRoutePath("", shopId));
  
  return (
    // Your JSX
  );
}
```

### Link to Shop Pages
```javascript
import { Link } from "react-router-dom";
import { getRoutePath } from "../utils/shopUtils";
import { useShop } from "../context/ShopContext";

const { shopId } = useShop();

<Link to={getRoutePath("cart", shopId)}>
  View Cart
</Link>
```

## Firebase Paths

| Data Type | Firestore Path |
|-----------|----------------|
| Shop | `cakeShops/{shopId}` |
| Cakes | `cakeShops/{shopId}/cakes/{cakeId}` |
| Options | `cakeShops/{shopId}/options/customizer` |
| Orders | `cakeShops/{shopId}/orders/{orderId}` |

## Quick Commands

```bash
# Start development server
npm run dev

# Test different shops
http://localhost:5173/onboarding              # Create new shop
http://localhost:5173/shop/my-cake-shop       # View shop storefront
http://localhost:5173/dashboard                # Admin dashboard
```

## Key Components

| Component | Location | Purpose |
|-----------|----------|---------|
| App | `src/App.jsx` | Route definitions |
| ShopContext | `src/context/ShopContext.jsx` | Shop data & ID |
| Navbar | `src/components/Navbar.jsx` | Navigation bar |
| Onboarding | `src/pages/Onboarding.jsx` | Shop creation |
| Landing | `src/pages/Landing.jsx` | Shop storefront |
| CustomizeCake | `src/pages/CustomizeCake.jsx` | Cake customizer |
| Cart | `src/pages/Cart.jsx` | Shopping cart |
| Checkout | `src/pages/Checkout.jsx` | Order checkout |
| OrderTracking | `src/pages/OrderTracking.jsx` | Track orders |
| AdminDashboard | `src/pages/AdminDashboard.jsx` | Admin panel |

## Status Codes (Orders)

- `pending` - Order placed, awaiting confirmation
- `confirmed` - Order confirmed by shop
- `preparing` - Cake is being prepared
- `ready` - Ready for pickup/delivery
- `completed` - Order fulfilled
- `cancelled` - Order cancelled
