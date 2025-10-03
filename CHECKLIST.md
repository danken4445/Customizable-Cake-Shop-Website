# ✅ Setup Checklist

Use this checklist to set up your cake shop website step by step.

## Phase 1: Initial Setup (15 minutes)

### 1. Prerequisites

- [ ] Node.js 20.19+ or 22.12+ installed
  - Check: Run `node --version` in terminal
  - Download: https://nodejs.org/
- [ ] Code editor installed (VS Code recommended)
- [ ] Modern web browser (Chrome, Firefox, Edge)
- [ ] Git installed (optional, for version control)

### 2. Dependencies

- [ ] Dependencies installed (already done!)
  - If needed: `npm install`
- [ ] Check `package.json` exists
- [ ] Check `node_modules` folder exists

---

## Phase 2: Firebase Setup (10 minutes)

### 1. Create Firebase Project

- [ ] Go to https://console.firebase.google.com/
- [ ] Click "Add project"
- [ ] Enter project name (e.g., "cake-shop-website")
- [ ] Disable Google Analytics (or enable if you want it)
- [ ] Click "Create project"
- [ ] Wait for project to be created

### 2. Enable Firestore Database

- [ ] In Firebase Console, click "Firestore Database"
- [ ] Click "Create database"
- [ ] Select "Start in test mode" (for development)
- [ ] Choose your region (closest to your location)
- [ ] Click "Enable"
- [ ] Wait for database to be created

### 3. Enable Firebase Storage

- [ ] In Firebase Console, click "Storage"
- [ ] Click "Get started"
- [ ] Click "Next" (accept default rules)
- [ ] Choose same region as Firestore
- [ ] Click "Done"
- [ ] Storage is now enabled

### 4. Enable Authentication

- [ ] In Firebase Console, click "Authentication"
- [ ] Click "Get started"
- [ ] Click "Email/Password" tab
- [ ] Toggle "Enable"
- [ ] Click "Save"

### 5. Create Admin User

- [ ] In Authentication, click "Users" tab
- [ ] Click "Add user"
- [ ] Email: `admin@test.com` (or your email)
- [ ] Password: Create a secure password
- [ ] Click "Add user"
- [ ] ✅ Remember these credentials!

### 6. Get Firebase Configuration

- [ ] Click the gear icon (⚙️) → "Project settings"
- [ ] Scroll down to "Your apps"
- [ ] Click the web icon (`</>`)
- [ ] Register app (nickname: "Cake Shop Web")
- [ ] Copy the `firebaseConfig` object
- [ ] Keep this tab open for next step

### 7. Update Firebase Config in Code

- [ ] Open `src/services/firebase.js`
- [ ] Replace placeholder config with your config
- [ ] Save the file
- [ ] ✅ Firebase is now connected!

---

## Phase 3: Add Demo Data (15 minutes)

### 1. Create Your First Shop

- [ ] Go to Firebase Console → Firestore Database
- [ ] Click "Start collection"
- [ ] Collection ID: `cakeShops`
- [ ] Click "Next"

#### Add Shop Document

- [ ] Document ID: `shop1` (or "Auto-ID")
- [ ] Add field: `name` (string) = "Sweet Treats Bakery"
- [ ] Add field: `description` (string) = "Homemade cakes made with love"
- [ ] Add field: `logoUrl` (string) = "https://via.placeholder.com/100?text=STB"
- [ ] Add field: `coverImageUrl` (string) = "https://via.placeholder.com/800x300?text=Sweet+Treats"
- [ ] Click "Save"
- [ ] ✅ Shop created!

### 2. Add Cakes to the Shop

- [ ] Click on the `shop1` document
- [ ] Click "Start collection"
- [ ] Collection ID: `cakes`
- [ ] Document ID: `cake1`

#### Add Cake Fields

- [ ] Add field: `name` (string) = "Chocolate Fudge Cake"
- [ ] Add field: `description` (string) = "Rich and moist chocolate cake"
- [ ] Add field: `basePrice` (number) = 500
- [ ] Add field: `imageUrl` (string) = "https://via.placeholder.com/400x400?text=Chocolate+Cake"
- [ ] Click "Save"
- [ ] ✅ Cake added!

#### Add More Cakes (Optional)

- [ ] Repeat above for `cake2`, `cake3`, etc.

### 3. Add Customizer Options

- [ ] Go back to `shop1` document
- [ ] Click "Start collection"
- [ ] Collection ID: `options`
- [ ] Document ID: `customizer`

#### Add Bases Array

- [ ] Add field: `bases` (array)
- [ ] Add items: "Chocolate", "Vanilla", "Red Velvet", "Ube"
- [ ] Click "Save array"

#### Add Sizes Map

- [ ] Add field: `sizes` (map)
- [ ] Add key: `6-inch` → value: 500 (number)
- [ ] Add key: `8-inch` → value: 700 (number)
- [ ] Add key: `10-inch` → value: 1000 (number)
- [ ] Click "Save map"

#### Add Toppings Array

- [ ] Add field: `toppings` (array)
- [ ] Click "Add item" → Select "map"

**For each topping map, add:**

- [ ] Key: `name` → Value: "Strawberry" (string)
- [ ] Key: `price` → Value: 50 (number)
- [ ] Key: `imageUrl` → Value: "https://via.placeholder.com/80?text=🍓" (string)

**Add more toppings:**

- [ ] Cherry (price: 50)
- [ ] Blueberry (price: 50)
- [ ] Chocolate Drip (price: 75)
- [ ] Caramel (price: 75)

- [ ] Click "Save"
- [ ] ✅ Customizer options added!

---

## Phase 4: Test Locally (5 minutes)

### 1. Run Development Server

- [ ] Open terminal in project folder
- [ ] Run: `npm run dev`
- [ ] Wait for server to start
- [ ] You should see: "Local: http://localhost:5173"

### 2. Test in Browser

- [ ] Open http://localhost:5173
- [ ] ✅ You should see "Sweet Treats Bakery"

### 3. Test Customer Flow

- [ ] Click on "Sweet Treats Bakery"
- [ ] ✅ You should see "Chocolate Fudge Cake"
- [ ] Click "Customize"
- [ ] ✅ Customizer page loads
- [ ] Select a cake base
- [ ] Select a size
- [ ] ✅ Drag a topping onto the cake
- [ ] ✅ Price updates
- [ ] Click "Add to Cart"
- [ ] ✅ Cart badge shows "1"
- [ ] Click cart icon
- [ ] ✅ Cart shows your cake
- [ ] Click "Proceed to Checkout"
- [ ] Fill in your details
- [ ] Click "Place Order"
- [ ] ✅ Order submitted!

### 4. Test Admin Flow

- [ ] Go to http://localhost:5173/admin/shop1
- [ ] Enter your admin email and password
- [ ] Click "Login"
- [ ] ✅ Admin dashboard loads
- [ ] ✅ You should see the order you just placed
- [ ] Change order status to "Preparing"
- [ ] ✅ Status updates

---

## Phase 5: Customization (Optional, 30+ minutes)

### Replace Placeholder Images

- [ ] Find or create real cake images
- [ ] Upload to Firebase Storage:
  - [ ] Go to Storage in Firebase Console
  - [ ] Create folders: `shops/shop1/cakes/`
  - [ ] Upload cake images
  - [ ] Click on image → Copy URL
  - [ ] Update Firestore documents with real URLs
- [ ] Refresh app to see real images

### Customize Branding

- [ ] Update shop name in Firestore
- [ ] Update descriptions
- [ ] Change colors in `tailwind.config.js` (optional)
- [ ] Update navbar text in `src/components/Navbar.jsx`

### Add More Content

- [ ] Add more shops (repeat Phase 3)
- [ ] Add more cakes to each shop
- [ ] Add more topping options
- [ ] Add more sizes and prices

---

## Phase 6: Security & Production Prep (10 minutes)

### Update Firestore Rules

- [ ] Go to Firebase Console → Firestore Database → Rules
- [ ] Replace with production rules (see README.md)
- [ ] Click "Publish"

### Update Storage Rules

- [ ] Go to Firebase Console → Storage → Rules
- [ ] Replace with production rules (see README.md)
- [ ] Click "Publish"

### Add Authorized Domains

- [ ] Go to Firebase Console → Authentication → Settings
- [ ] Under "Authorized domains", add your production domain
- [ ] (Do this before deploying)

---

## Phase 7: Deployment (15-30 minutes)

### Choose a Platform

- [ ] Vercel (recommended, easiest)
- [ ] Netlify (easy)
- [ ] Firebase Hosting (integrated)
- [ ] GitHub Pages (free)

### Follow Deployment Guide

- [ ] Open `DEPLOYMENT.md`
- [ ] Follow steps for your chosen platform
- [ ] Deploy the app
- [ ] ✅ App is live!

### Test Production

- [ ] Visit your live URL
- [ ] Test all features work
- [ ] Test admin login works
- [ ] Test placing an order
- [ ] ✅ Everything works!

---

## Phase 8: Going Live (Ongoing)

### Share Your Website

- [ ] Share URL with friends/family for testing
- [ ] Get feedback
- [ ] Make improvements

### Monitor Usage

- [ ] Check Firebase Console → Firestore for database usage
- [ ] Check Storage for image usage
- [ ] Monitor Authentication for login attempts

### Maintain

- [ ] Regularly check orders
- [ ] Update order statuses
- [ ] Add new cakes/toppings as needed
- [ ] Upload new images

---

## Troubleshooting Checklist

### If app doesn't load:

- [ ] Check Firebase config is correct
- [ ] Check console for errors (F12 → Console)
- [ ] Check Node version (20.19+)
- [ ] Try `npm install` again
- [ ] Clear browser cache

### If "Shop not found":

- [ ] Verify `cakeShops` collection exists
- [ ] Verify `shop1` document exists
- [ ] Check collection/document names exactly match

### If customizer doesn't work:

- [ ] Verify `options/customizer` document exists
- [ ] Check all fields are present (bases, sizes, toppings)
- [ ] Check data types are correct (array, map, etc.)

### If drag-drop doesn't work:

- [ ] Use a mouse (not touch)
- [ ] Check browser console for errors
- [ ] Try a different browser

### If admin login fails:

- [ ] Verify email/password in Firebase Authentication
- [ ] Check browser console for errors
- [ ] Verify Firebase Authentication is enabled

---

## 🎉 Completion Checklist

When you've completed all phases:

- [ ] ✅ Firebase project created
- [ ] ✅ Firestore database populated
- [ ] ✅ Storage configured
- [ ] ✅ Admin user created
- [ ] ✅ App runs locally
- [ ] ✅ All features tested
- [ ] ✅ App deployed to production
- [ ] ✅ Production tested
- [ ] ✅ Ready to accept orders!

**Congratulations! Your cake shop is ready for business! 🎂**

---

## Quick Reference

| Task                   | File to Edit                |
| ---------------------- | --------------------------- |
| Change Firebase config | `src/services/firebase.js`  |
| Change navbar text     | `src/components/Navbar.jsx` |
| Change colors          | `tailwind.config.js`        |
| Add pages              | `src/pages/`                |
| Add components         | `src/components/`           |
| Change routes          | `src/App.jsx`               |

---

**Need help?** Check the other documentation files:

- `QUICKSTART.md` - Fast setup guide
- `README.md` - Full documentation
- `DEPLOYMENT.md` - Deployment instructions
- `ARCHITECTURE.js` - Technical overview
