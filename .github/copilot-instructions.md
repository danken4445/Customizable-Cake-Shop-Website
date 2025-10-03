# Copilot Instructions for Multi-Shop Cake Customizer

## Project Overview

React + Vite SPA for **white-label cake shop platform** with Firebase backend. Each shop gets their own branded website (subdomain/domain) with customized landing page, cake catalog, and customizer. Shop owners manage their exclusive storefront and orders via admin dashboard.

## White-Label Architecture

- **Single codebase, multiple storefronts**: One deployment serves all shops via subdomain/slug routing
- **Shop identification**: Extract shopId from URL subdomain (e.g., `cakeshopa.vercel.app`) or path slug (e.g., `/cakeshopa`)
- **Branded landing page**: Each shop's landing page shows ONLY their cakes, logo, colors, and branding
- **No shop browsing**: Customers only see the shop they're visiting - no multi-shop marketplace

## Architecture Patterns

### Data Flow: Firebase-Centric

- **No REST API**: Direct Firestore SDK calls from React components (`getDocs`, `getDoc`, `addDoc`)
- **Multi-tenant structure**: Each shop is a Firestore document with subcollections (`cakes`, `options`, `orders`)
- **Example path**: `cakeShops/{shopId}/options/customizer` contains bases, sizes, toppings arrays
- **State**: Context API for cart (localStorage persistence), local component state for everything else

### Component Architecture

```
App.jsx (NextUIProvider → CartProvider → Router)
  ├── Navbar (cart badge from CartContext)
  ├── Pages (6 routes, all fetch Firestore directly in useEffect)
  └── Components (presentational + DnD-enabled)
```

### Critical Pattern: Firestore Subcollections

Pages use **nested paths** for single-shop data:

- Landing page cakes: `collection(db, "cakeShops", shopId, "cakes")`
- Customizer options: `doc(db, "cakeShops", shopId, "options", "customizer")`
- Orders: `collection(db, "cakeShops", shopId, "orders")`
- Shop branding: `doc(db, "cakeShops", shopId)` - contains name, logo, colors, coverImage

### Shop Identification Pattern

Extract shopId from URL in every page:

```javascript
// Option 1: Subdomain (production)
const hostname = window.location.hostname; // "cakeshopa.vercel.app"
const shopId = hostname.split(".")[0]; // "cakeshopa"

// Option 2: Path slug (development)
const shopId = window.location.pathname.split("/")[1]; // "/cakeshopa/..."
```

Store shopId in context or pass via route params to all pages.

## Key Workflows

### Development Server

```bash
npm run dev  # Port 5173 (or auto-increments if taken)
```

**Critical**: Project uses ES modules (`"type": "module"` in package.json). All configs must use `export default`, not `module.exports`.

### Firebase Configuration

- Config lives in `src/services/firebase.js` (already populated with project credentials)
- Exports `db` (Firestore), `storage`, `auth` - import these directly, not the app instance
- **No .env**: Firebase config is committed (public keys, safe for client-side)

### Adding New Features

1. **New page**: Add route in `App.jsx`, create in `src/pages/`
2. **Firestore query**: Always handle loading state, check `.exists()` before accessing `.data()`
3. **Cart items**: Use `addToCart({ shopId, shopName, totalPrice, ...customization })` - must include shopId for checkout grouping

## Project-Specific Conventions

### Drag-and-Drop (react-dnd)

- `ToppingItem.jsx`: `useDrag` with type "topping", item is topping object
- `CakeCanvas.jsx`: `useDrop` calculates position as percentage (`x`/`y` in 0-100 range)
- Placed toppings stored as array with unique `id: Date.now()` - click to remove

### Price Calculation Pattern

See `CustomizeCake.jsx` `calculateTotalPrice()`:

```javascript
let total = cake?.basePrice || 0;
total = options.sizes[selectedSize] || total; // Size overrides base
placedToppings.forEach((t) => (total += t.price)); // Toppings additive
```

### Routing Convention

- Customer flow: `/` (shop landing) → `/customize/:cakeId` → `/cart` → `/checkout`
- Admin: `/admin` (Firebase Auth required, shows current shop's dashboard)
- **Shop-specific URLs**: Each deployment/subdomain shows only one shop
- **Development mode**: Use path slug `/shopId` to test different shops locally

### Styling

- Next UI components for everything (never raw HTML buttons/inputs)
- Tailwind utilities for layout (`className="flex gap-4 grid-cols-3"`)
- Gradients convention: `from-pink-X to-purple-X` (brand colors)

## Integration Points

### Firebase Auth (Admin Only)

- `AdminDashboard.jsx` uses `signInWithEmailAndPassword` - no registration flow
- Auth state: `onAuthStateChanged` listener, conditional render (login form vs dashboard)
- **No role checks**: Anyone authenticated can access any `/admin/:shopId`

### Cart Context

- Lives in `src/context/CartContext.jsx` - wraps Router in App.jsx
- **Persistence**: Auto-saves to `localStorage` key `"cakeCart"` on every change
- **Checkout grouping**: Orders split by `shopId` - loop through cart, group by shop, create separate Firestore docs

### Next UI Setup

- Requires `NextUIProvider` wrapper (already in App.jsx)
- Tailwind config uses `plugins: [nextui()]` - imports from `@nextui-org/react`
- **ES module syntax required**: `import { nextui } from "@nextui-org/react"`

## Common Gotchas

1. **PostCSS config must use ES modules**: `export default { plugins: { tailwindcss: {}, autoprefixer: {} } }`
2. **Fast Refresh warning on CartContext**: Suppress with `// eslint-disable-next-line react-refresh/only-export-components` above `export const useCart`
3. **Firestore empty checks**: Always use `docSnap.exists()` before `docSnap.data()` - missing shops/cakes crash without this
4. **DnD requires provider**: Wrap drag-drop pages in `<DndProvider backend={HTML5Backend}>`
5. **SelectItem keys**: Next UI Select requires `selectedKeys={[value]}` as array, not string

## File References

- **Firebase schema**: See `FIREBASE_SETUP.md` for complete Firestore structure
- **Route definitions**: `src/App.jsx` lines 19-25
- **Cart logic**: `src/context/CartContext.jsx`
- **DnD implementation**: `src/pages/CustomizeCake.jsx` + `src/components/CakeCanvas.jsx`
- **Multi-shop checkout**: `src/pages/Checkout.jsx` lines 30-45 (grouping logic)

## Quick Commands

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run preview  # Preview production build
```

No tests configured. Deployment targets: Vercel, Netlify, Firebase Hosting (see `DEPLOYMENT.md`).
