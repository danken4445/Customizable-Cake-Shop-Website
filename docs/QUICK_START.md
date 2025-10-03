# 🚀 Quick Start Guide

Get your multi-tenant cake shop platform running in 5 minutes!

## ⚡ Quick Setup

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Start Development Server
```bash
npm run dev
```

You should see:
```
  VITE v7.1.7  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Step 3: Create Your First Shop

1. **Open your browser**: `http://localhost:5173/onboarding`

2. **Fill out the form**:
   - Shop Name: "Sweet Dreams Bakery"
   - Shop URL Slug: (auto-generated: "sweet-dreams-bakery")
   - Owner Name: Your name
   - Owner Email: Your email
   - Description: "Best custom cakes in town!"

3. **Choose colors** (optional):
   - Primary Color: Pick your brand color
   - Secondary Color: Pick accent color

4. **Upload images** (optional):
   - Logo: Your shop logo
   - Cover: Hero/banner image

5. **Click "Create Shop"**

6. **Success!** You'll be redirected to: `http://localhost:5173/shop/sweet-dreams-bakery`

---

## 🎂 Test the Customer Flow

### Browse Cakes
Visit: `http://localhost:5173/shop/sweet-dreams-bakery`

You should see:
- Shop branding (name, logo, colors)
- Default sample cake: "Classic Vanilla Delight"
- Grid layout with cake cards

### Customize a Cake

1. **Click on the cake** → Redirects to customizer

2. **Select options**:
   - Base: Vanilla, Chocolate, Red Velvet, or Lemon
   - Size: Small, Medium, or Large

3. **Add toppings**:
   - Drag 🍓 Strawberries onto the cake
   - Drag 🍫 Chocolate Chips
   - Drag ✨ Sprinkles
   - Click placed toppings to remove them

4. **See price update** in real-time

5. **Click "Add to Cart"** → Redirects to cart

### Review Cart

Visit: `http://localhost:5173/shop/sweet-dreams-bakery/cart`

You should see:
- Your customized cake
- All selected options
- Total price
- Remove and Checkout buttons

### Checkout

1. **Click "Proceed to Checkout"**

2. **Fill in details**:
   - Full Name: "John Doe"
   - Contact: "09123456789"
   - Check "Pickup" OR enter delivery address

3. **Click "Place Order"**

4. **Success!** → Redirects to order tracking page

### Track Order

Visit: `http://localhost:5173/shop/sweet-dreams-bakery/track/{orderId}`

You should see:
- Order number
- Current status: "Pending"
- Progress bar
- Order items
- Customer information
- Shop contact details

---

## 🎨 Customize Your Shop

### Update Shop Branding

1. **Create multiple shops** with different branding:
   ```
   /onboarding → Create "Chocolate Heaven"
   /onboarding → Create "Vanilla Paradise"
   /onboarding → Create "Red Velvet Dreams"
   ```

2. **Each shop gets unique**:
   - URL: `/shop/chocolate-heaven`
   - Branding colors
   - Logo and cover image
   - Isolated cakes and orders

### Add More Cakes

Currently, shops start with 1 sample cake. To add more:

1. **Go to Firebase Console**: https://console.firebase.google.com
2. **Select your project**: posapplication-36ef9
3. **Navigate to Firestore Database**
4. **Find**: `cakeShops/{shopId}/cakes`
5. **Add document**:
   ```javascript
   {
     name: "Chocolate Fudge Delight",
     description: "Rich chocolate cake with fudge layers",
     basePrice: 45,
     image: "https://images.unsplash.com/photo-...",
     category: "Chocolate",
     isAvailable: true,
     createdAt: new Date().toISOString()
   }
   ```

### Customize Cake Options

To change available bases, sizes, or toppings:

1. **Firebase Firestore** → `cakeShops/{shopId}/options/customizer`
2. **Update document**:
   ```javascript
   {
     bases: [
       { id: 1, name: "Vanilla", price: 0 },
       { id: 2, name: "Chocolate", price: 5 },
       // Add more...
     ],
     sizes: [
       { id: 1, name: "Small (6 inch)", price: 25 },
       { id: 2, name: "Medium (8 inch)", price: 40 },
       // Add more...
     ],
     toppings: [
       { id: 1, name: "Strawberries", price: 5, emoji: "🍓" },
       { id: 2, name: "Blueberries", price: 6, emoji: "🫐" },
       // Add more...
     ]
   }
   ```

---

## 🔐 Admin Dashboard

### Access Admin Panel

Visit: `http://localhost:5173/dashboard`

**Note**: Requires Firebase Authentication

### First-time Setup

1. **Create admin user** in Firebase Console:
   - Go to Firebase → Authentication
   - Click "Add user"
   - Enter email and password
   - Click "Add user"

2. **Sign in** on dashboard page

3. **View and manage**:
   - All orders across shops
   - Shop settings
   - Cake inventory

---

## 🌐 Test Multiple Shops

### Create 3 Different Shops

```bash
# Shop 1: Sweet Dreams
http://localhost:5173/onboarding
→ Name: "Sweet Dreams Bakery"
→ Slug: "sweet-dreams-bakery"
→ Colors: Pink & Purple

# Shop 2: Chocolate Heaven
http://localhost:5173/onboarding
→ Name: "Chocolate Heaven"
→ Slug: "chocolate-heaven"
→ Colors: Brown & Orange

# Shop 3: Vanilla Paradise
http://localhost:5173/onboarding
→ Name: "Vanilla Paradise"
→ Slug: "vanilla-paradise"
→ Colors: Cream & Gold
```

### Visit Each Shop

```bash
http://localhost:5173/shop/sweet-dreams-bakery
http://localhost:5173/shop/chocolate-heaven
http://localhost:5173/shop/vanilla-paradise
```

### Test Multi-Shop Cart

1. Visit Shop 1 → Add cake to cart
2. Visit Shop 2 → Add cake to cart
3. Visit Shop 3 → Add cake to cart
4. Go to checkout → Orders will be grouped by shop
5. Each shop receives their order separately in Firestore

---

## 📱 Test Responsive Design

Open DevTools (F12) and test on:
- Desktop (1920x1080)
- Tablet (768x1024)
- Mobile (375x667)

All pages are responsive with Tailwind CSS!

---

## 🔍 Firebase Data Verification

### Check Shop Created

1. **Firebase Console** → Firestore Database
2. **Navigate**: `cakeShops/{your-shop-slug}`
3. **Verify fields**:
   - name
   - slug
   - ownerEmail
   - logo (if uploaded)
   - primaryColor
   - secondaryColor

### Check Order Created

1. **Place an order** via checkout
2. **Firebase Console** → Firestore Database
3. **Navigate**: `cakeShops/{shopId}/orders/{orderId}`
4. **Verify fields**:
   - customerName
   - customerPhone
   - items array
   - totalAmount
   - status: "pending"

### Check Images Uploaded

1. **Firebase Console** → Storage
2. **Navigate**: `shops/{shopId}/`
3. **Verify files**:
   - logo.jpg
   - cover.jpg

---

## 🛠️ Common Development Tasks

### Add a New Page

1. **Create file**: `src/pages/NewPage.jsx`
   ```jsx
   import { useShop } from "../context/ShopContext";
   
   export default function NewPage() {
     const { shop, shopId } = useShop();
     
     return (
       <div>
         <h1>New Page for {shop?.name}</h1>
       </div>
     );
   }
   ```

2. **Add route**: `src/App.jsx`
   ```jsx
   import NewPage from "./pages/NewPage";
   
   // In Routes:
   <Route path="/shop/:shopId/new-page" element={<NewPage />} />
   ```

3. **Test**: `http://localhost:5173/shop/your-shop/new-page`

### Add a New Component

1. **Create file**: `src/components/NewComponent.jsx`
   ```jsx
   export default function NewComponent({ title }) {
     return <div>{title}</div>;
   }
   ```

2. **Import and use**:
   ```jsx
   import NewComponent from "../components/NewComponent";
   
   <NewComponent title="Hello!" />
   ```

---

## 🎯 Next Steps

1. ✅ **Complete Quick Start** (you are here!)
2. 📖 **Read Documentation**:
   - [ROUTING_GUIDE.md](docs/ROUTING_GUIDE.md)
   - [QUICK_REFERENCE.md](docs/QUICK_REFERENCE.md)
3. 🎨 **Customize Your Shops**
4. 🧪 **Test All Features**
5. 🚀 **Deploy to Production** (see [MIGRATION_CHECKLIST.md](docs/MIGRATION_CHECKLIST.md))

---

## 🆘 Troubleshooting

### Port 5173 Already in Use
```bash
# Kill process on port 5173 (Windows)
npx kill-port 5173

# Or Vite will auto-increment to 5174
```

### Firebase Connection Error
- Check internet connection
- Verify Firebase config in `src/services/firebase.js`
- Check Firebase Console for project status

### Images Not Loading
- Check image URLs are valid
- Verify Firebase Storage rules
- Check browser console for CORS errors

### Styles Not Applying
```bash
# Rebuild Tailwind
npm run build

# Or restart dev server
# Ctrl+C then npm run dev
```

---

## ✨ You're Ready!

Your multi-tenant cake shop platform is up and running! 🎉

**What you can do now:**
- ✅ Create unlimited shops
- ✅ Customize cakes with drag-drop
- ✅ Accept customer orders
- ✅ Track order status
- ✅ Manage via admin dashboard

**Happy baking! 🎂**
