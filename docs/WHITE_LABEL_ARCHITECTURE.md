# 🏪 White-Label Architecture Guide

## Overview

The cake shop website has been refactored from a **multi-shop marketplace** to a **white-label single-shop platform**. Each cake shop now gets their own branded website deployed to a unique subdomain.

## Key Changes

### Before (Marketplace Model)

- Landing page showed all cake shops
- Users browse shops, then select one
- Routes: `/shop/:shopId/customize/:cakeId`
- Single deployment for all shops

### After (White-Label Model)

- Each shop has exclusive branded storefront
- Landing page shows only current shop's cakes
- Routes: `/customize/:cakeId` (shop determined by subdomain)
- Single codebase, multiple deployments (one per shop)

## Shop Identification

### Production (Subdomain-based)

- **URL**: `cakeshopa.vercel.app`
- **Shop ID**: Extracted from subdomain → `"cakeshopa"`
- **Example**: `customcakes.vercel.app` → shopId = `"customcakes"`

### Development (Path-based)

- **URL**: `localhost:5174/shop1`
- **Shop ID**: Extracted from first path segment → `"shop1"`
- **Fallback**: Uses `VITE_SHOP_ID` env variable or `"shop1"` as default

### Utility Functions (`src/utils/shopUtils.js`)

```javascript
import { getShopId, getRoutePath } from "../utils/shopUtils";

// Get current shop ID
const shopId = getShopId(); // Returns: "cakeshopa" (prod) or "shop1" (dev)

// Generate route paths
const homePath = getRoutePath("/", shopId);
// Production: "/"
// Development: "/shop1"

const customizePath = getRoutePath("/customize/cake123", shopId);
// Production: "/customize/cake123"
// Development: "/shop1/customize/cake123"
```

## Routing Structure

### Production Routes (Subdomain-based)

```javascript
/ → Landing (show shop's cakes)
/customize/:cakeId → Cake customizer
/cart → Shopping cart
/checkout → Checkout page
/admin → Admin dashboard
```

### Development Routes (Path-based for testing)

```javascript
/:shopId → Landing
/:shopId/customize/:cakeId → Cake customizer
/:shopId/cart → Shopping cart
/:shopId/checkout → Checkout
/:shopId/admin → Admin dashboard
```

## ShopContext

Global context providing current shop information to all components.

### Usage

```javascript
import { useShop } from "../context/ShopContext";

function MyComponent() {
  const { shop, shopId, loading, error } = useShop();

  if (loading) return <Spinner />;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h1>{shop.name}</h1>
      <p>{shop.description}</p>
    </div>
  );
}
```

### Shop Object Structure

```javascript
{
  id: "cakeshopa",
  name: "Custom Cakes by Anna",
  description: "Premium custom cakes for all occasions",
  logo: "https://...",
  coverImage: "https://...",
  branding: {
    colors: {
      primary: "#ff69b4",
      secondary: "#9b59b6"
    }
  }
}
```

## Firestore Structure

### Shop Document

```
cakeShops/{shopId}
  ├── name: "Custom Cakes by Anna"
  ├── description: "..."
  ├── logo: "https://..."
  ├── coverImage: "https://..."
  └── branding: {
      colors: {
        primary: "#ff69b4",
        secondary: "#9b59b6"
      }
    }
```

### Subcollections

```
cakeShops/{shopId}
  ├── cakes/
  │   └── {cakeId}
  │       ├── name: "Chocolate Cake"
  │       ├── basePrice: 500
  │       └── image: "https://..."
  ├── options/
  │   └── customizer
  │       ├── bases: ["Chocolate", "Vanilla"]
  │       ├── sizes: { "Small": 500, "Medium": 800 }
  │       └── toppings: [...]
  └── orders/
      └── {orderId}
          ├── customerName: "John Doe"
          ├── status: "pending"
          └── items: [...]
```

## Deployment Strategy

### Single Shop Deployment

1. **Create Environment File** (`.env.production`)

   ```env
   VITE_SHOP_ID=cakeshopa
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   # ... other Firebase config
   ```

2. **Deploy to Vercel**

   ```bash
   vercel --prod
   ```

3. **Configure Custom Domain**
   - Add subdomain: `cakeshopa.vercel.app`
   - Or custom domain: `cakeshopa.com`

### Multi-Shop Deployment (Different Shops)

For **Shop A**:

```bash
# .env.production
VITE_SHOP_ID=cakeshopa

vercel --prod --name cakeshopa
# Domain: cakeshopa.vercel.app
```

For **Shop B**:

```bash
# .env.production
VITE_SHOP_ID=cakeshopb

vercel --prod --name cakeshopb
# Domain: cakeshopb.vercel.app
```

## Component Updates

### Before (Multi-Shop)

```javascript
// Landing.jsx - showed ALL shops
const fetchShops = async () => {
  const shops = await getDocs(collection(db, "cakeShops"));
  setShops(shops);
};

<ShopCard key={shop.id} shop={shop} />;
```

### After (White-Label)

```javascript
// Landing.jsx - shows ONLY current shop's cakes
const { shop, shopId } = useShop();

const fetchCakes = async () => {
  const cakes = await getDocs(collection(db, "cakeShops", shopId, "cakes"));
  setCakes(cakes);
};

<CakeCard key={cake.id} cake={cake} />;
```

## Navigation

### Component Example

```javascript
import { useNavigate } from "react-router-dom";
import { useShop } from "../context/ShopContext";
import { getRoutePath } from "../utils/shopUtils";

function MyComponent() {
  const navigate = useNavigate();
  const { shopId } = useShop();

  const goToCustomizer = (cakeId) => {
    navigate(getRoutePath(`/customize/${cakeId}`, shopId));
  };

  return <Button onClick={() => goToCustomizer("cake123")}>Customize</Button>;
}
```

## Branding Customization

### Apply Shop Colors

```javascript
const { shop } = useShop();
const brandColors = shop?.branding?.colors || {
  primary: "pink",
  secondary: "purple",
};

<div
  style={{
    background: `linear-gradient(to right, ${brandColors.primary}, ${brandColors.secondary})`,
  }}
>
  <h1 style={{ color: brandColors.primary }}>{shop.name}</h1>
</div>;
```

### Display Shop Logo

```javascript
{
  shop?.logo && (
    <Image
      src={shop.logo}
      alt={`${shop.name} logo`}
      className="w-24 h-24 rounded-full"
    />
  );
}
```

## Development Testing

### Test Multiple Shops Locally

1. **Shop 1**: `http://localhost:5174/shop1`
2. **Shop 2**: `http://localhost:5174/shop2`
3. **Shop 3**: `http://localhost:5174/shop3`

Each route will load different shop data from Firestore.

### Environment Variable Override

```env
# .env.local
VITE_SHOP_ID=myshop
```

Then access directly: `http://localhost:5174/`

## Migration Checklist

- [x] Create `ShopContext` for global shop state
- [x] Create `shopUtils.js` with `getShopId()` and `getRoutePath()`
- [x] Update `App.jsx` routing structure
- [x] Refactor `Landing.jsx` to show single shop's cakes
- [x] Update `CustomizeCake.jsx` to use ShopContext
- [x] Update `Navbar.jsx` with shop branding
- [x] Update `Cart.jsx` and `Checkout.jsx` navigation
- [x] Update `AdminDashboard.jsx` to use ShopContext
- [x] Remove `ShopCard` component (no longer needed)
- [x] Remove `ShopShowcase` page (merged into Landing)
- [x] Update `.github/copilot-instructions.md`

## Next Steps

1. **Add Shop Branding Fields to Firestore**

   - Update existing shop documents with `logo`, `coverImage`, `branding.colors`

2. **Create Admin Interface for Branding**

   - Allow shop owners to upload logos
   - Customize primary/secondary colors
   - Set shop description

3. **Environment-Specific Builds**

   - Create deployment scripts for each shop
   - Automate multi-shop deployment pipeline

4. **Custom Domain Support**

   - Configure DNS for custom domains
   - SSL certificates for shop domains

5. **Analytics Per Shop**
   - Track orders, revenue per shop
   - Shop-specific analytics dashboard

## Troubleshooting

### Issue: "Shop not found"

**Solution**: Check that shop ID in subdomain/path matches Firestore document ID

### Issue: Wrong shop loads

**Solution**: Clear localStorage and verify `getShopId()` returns correct value

### Issue: Broken links in development

**Solution**: Always use `getRoutePath(path, shopId)` instead of hardcoded paths

### Issue: Logo/branding not showing

**Solution**: Ensure Firestore shop document has `logo`, `coverImage`, and `branding` fields

## Resources

- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Vercel Deployment Guide](https://vercel.com/docs)
- [React Context API](https://react.dev/reference/react/useContext)
