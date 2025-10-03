# 🚀 Quick Start Guide - White-Label Cake Shop

## What Changed?

Your cake shop platform is now a **white-label system**. Instead of showing all shops on one website, each shop gets its own branded storefront.

### Examples

- **Shop A**: `cakeshopa.vercel.app` → Shows only Shop A's cakes
- **Shop B**: `sweetcakes.com` → Shows only Shop B's cakes
- **Shop C**: `customcakes.vercel.app` → Shows only Shop C's cakes

---

## 🏃 Running the Project

### Development Mode (Test Multiple Shops)

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Access different shops
http://localhost:5174/shop1     # Shop 1
http://localhost:5174/shop2     # Shop 2
http://localhost:5174/myshop    # Any shop ID
```

### How It Works (Development)

- The first path segment (`/shop1`) identifies which shop to load
- Data is fetched from `cakeShops/shop1` in Firestore
- Each shop is completely isolated

---

## 🌐 Production Deployment

### Deploy for a Single Shop

```bash
# 1. Create .env.production
echo "VITE_SHOP_ID=cakeshopa" > .env.production

# 2. Build the project
npm run build

# 3. Deploy to Vercel
vercel --prod

# 4. Configure subdomain
# Vercel Dashboard → Settings → Domains
# Add: cakeshopa.vercel.app
```

### How It Works (Production)

- Shop ID is extracted from subdomain (`cakeshopa.vercel.app` → `shopId = "cakeshopa"`)
- Fallback to `VITE_SHOP_ID` environment variable
- Data fetched from `cakeShops/cakeshopa` in Firestore

---

## 📝 Setting Up a New Shop

### 1. Add Shop to Firestore

In Firebase Console → Firestore Database:

```javascript
Collection: cakeShops
Document ID: mynewshop

Fields:
{
  name: "My Awesome Cakes",
  description: "Delicious custom cakes for every occasion",
  logo: "https://yourimageurl.com/logo.png",          // Optional
  coverImage: "https://yourimageurl.com/cover.jpg",   // Optional
  branding: {
    colors: {
      primary: "#ff69b4",      // Pink
      secondary: "#9b59b6"     // Purple
    }
  }
}
```

### 2. Add Cakes

```javascript
Collection: cakeShops/mynewshop/cakes
Document ID: cake1

Fields:
{
  name: "Chocolate Delight",
  description: "Rich chocolate cake with ganache",
  basePrice: 500,
  image: "https://yourimageurl.com/cake.jpg"
}
```

### 3. Add Customization Options

```javascript
Collection: cakeShops/mynewshop/options
Document ID: customizer

Fields:
{
  bases: ["Chocolate", "Vanilla", "Red Velvet"],
  sizes: {
    "Small (6-inch)": 500,
    "Medium (8-inch)": 800,
    "Large (10-inch)": 1200
  },
  toppings: [
    {
      name: "Strawberries",
      emoji: "🍓",
      price: 50
    },
    {
      name: "Chocolate Chips",
      emoji: "🍫",
      price: 30
    }
  ]
}
```

### 4. Deploy

```bash
# Set shop ID
VITE_SHOP_ID=mynewshop vercel --prod --name mynewshop

# Result: mynewshop.vercel.app
```

### 5. Access

Visit `mynewshop.vercel.app` to see your shop!

---

## 🎨 Customizing Shop Branding

### Logo & Cover Image

Upload images to Firebase Storage or use any image URL:

```javascript
// In Firestore: cakeShops/myshop
{
  logo: "https://firebasestorage.googleapis.com/.../logo.png",
  coverImage: "https://firebasestorage.googleapis.com/.../cover.jpg"
}
```

### Colors

Update the branding colors:

```javascript
// In Firestore: cakeShops/myshop
{
  branding: {
    colors: {
      primary: "#e91e63",    // Your primary color (hex)
      secondary: "#673ab7"   // Your secondary color (hex)
    }
  }
}
```

The app will automatically apply these colors to:

- Background gradients
- Headers and titles
- Buttons and accents

---

## 📱 Features Available

### Customer Features

- ✅ Browse shop's cake catalog
- ✅ Drag-and-drop cake customization
- ✅ Add cakes to cart
- ✅ Checkout with delivery/pickup options
- ✅ Real-time price calculation

### Admin Features

- ✅ Login with Firebase Authentication
- ✅ View all orders
- ✅ Update order status (pending → preparing → ready → completed)
- ✅ Order details (customer info, items, total)

---

## 🔐 Admin Access

### Setup Admin Account

```bash
# In Firebase Console → Authentication
# Add user with email/password
Email: admin@yourshop.com
Password: YourSecurePassword123
```

### Access Admin Dashboard

```bash
# Development
http://localhost:5174/shop1/admin

# Production
https://yourshop.vercel.app/admin
```

Login with the email/password you created.

---

## 🛠️ Key Files to Know

### Configuration

- **`src/services/firebase.js`**: Firebase credentials
- **`.env.production`**: Shop ID for production builds
- **`.env.local`**: Shop ID for local development

### Components

- **`src/context/ShopContext.jsx`**: Manages current shop data
- **`src/utils/shopUtils.js`**: Shop ID extraction logic
- **`src/pages/Landing.jsx`**: Shop homepage (cake showcase)
- **`src/pages/CustomizeCake.jsx`**: Drag-drop customizer
- **`src/pages/AdminDashboard.jsx`**: Admin panel

### Documentation

- **`WHITE_LABEL_ARCHITECTURE.md`**: Complete architecture guide
- **`MIGRATION_COMPLETE.md`**: Migration summary
- **`FIREBASE_SETUP.md`**: Firestore setup instructions

---

## 🐛 Common Issues

### "Shop not found" Error

**Problem**: The shop ID doesn't exist in Firestore

**Solution**:

1. Check Firestore for document: `cakeShops/your-shop-id`
2. Ensure document ID matches exactly (case-sensitive)

### Wrong Shop Loads

**Problem**: Incorrect shop ID detection

**Solution**:

```javascript
// Check in browser console
import { getShopId } from "./src/utils/shopUtils.js";
console.log(getShopId()); // Should show correct shop ID
```

### Images Not Showing

**Problem**: Invalid image URLs

**Solution**:

1. Upload images to Firebase Storage
2. Make sure URLs are publicly accessible
3. Use full HTTPS URLs

### Cart Not Working

**Problem**: localStorage restrictions

**Solution**:

- Cart uses localStorage (`cakeCart` key)
- Check browser console for errors
- Ensure localStorage is enabled

---

## 📊 Monitoring & Analytics

### View Orders

1. Go to Admin Dashboard: `/admin`
2. Login with admin credentials
3. See all orders sorted by date

### Check Firestore

1. Firebase Console → Firestore Database
2. Navigate to `cakeShops/{yourShopId}/orders`
3. See all order documents

### Firebase Analytics

- Enable Firebase Analytics in Firebase Console
- Track user behavior, conversions, etc.

---

## 🚀 Deployment Checklist

For each new shop deployment:

- [ ] Create shop document in Firestore
- [ ] Add at least one cake to showcase
- [ ] Add customization options (bases, sizes, toppings)
- [ ] Upload logo and cover image (optional)
- [ ] Set branding colors (optional)
- [ ] Create admin user in Firebase Authentication
- [ ] Set `VITE_SHOP_ID` environment variable
- [ ] Deploy to Vercel with unique project name
- [ ] Configure subdomain (e.g., `shopname.vercel.app`)
- [ ] Test: landing page, customizer, cart, checkout, admin
- [ ] Share URL with shop owner

---

## 💡 Tips

### Multiple Shops from One Codebase

You can deploy the same codebase multiple times with different `VITE_SHOP_ID` values:

```bash
# Shop A
VITE_SHOP_ID=shopa vercel --prod --name shopa

# Shop B
VITE_SHOP_ID=shopb vercel --prod --name shopb

# Shop C
VITE_SHOP_ID=shopc vercel --prod --name shopc
```

### Local Testing

Test multiple shops without deploying:

```bash
npm run dev

# Then visit:
http://localhost:5174/shop1
http://localhost:5174/shop2
http://localhost:5174/shop3
```

### Environment Variables

Create `.env.local` to set default shop for development:

```env
VITE_SHOP_ID=myshop
```

Then you can access directly: `http://localhost:5174/`

---

## 📞 Support

Need help? Check these resources:

1. **`WHITE_LABEL_ARCHITECTURE.md`**: Detailed technical documentation
2. **`MIGRATION_COMPLETE.md`**: Complete list of changes
3. **Firebase Console**: Monitor Firestore and Authentication
4. **Browser DevTools**: Check console for errors

---

## 🎉 You're Ready!

Your white-label cake shop platform is fully set up and ready to deploy. Each shop gets:

- 🎨 Custom branding (logo, colors, name)
- 🍰 Exclusive product catalog
- 🛒 Independent cart & checkout
- 📊 Separate admin dashboard
- 🔐 Own authentication

**Deploy your first shop now!** 🚀
