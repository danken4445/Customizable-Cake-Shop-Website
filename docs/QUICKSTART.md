# 🚀 Quick Start Guide

## Prerequisites

- Node.js 20.19+ or 22.12+ (check with `node --version`)
- A Firebase account (free tier is fine)
- A code editor (VS Code recommended)

## Step 1: Firebase Setup (5 minutes)

1. **Create Firebase Project**

   - Go to https://console.firebase.google.com/
   - Click "Add project"
   - Name it "cake-shop" (or anything you like)
   - Disable Google Analytics (optional)

2. **Enable Firestore**

   - Click "Firestore Database" in the left sidebar
   - Click "Create database"
   - Select "Test mode" (for development)
   - Choose your region

3. **Enable Storage**

   - Click "Storage" in the left sidebar
   - Click "Get started"
   - Use default security rules

4. **Enable Authentication**

   - Click "Authentication" in the left sidebar
   - Click "Get started"
   - Enable "Email/Password"
   - Click "Add user" and create an admin account:
     - Email: `admin@test.com`
     - Password: `admin123` (change this!)

5. **Get Configuration**
   - Click the gear icon → Project settings
   - Scroll to "Your apps"
   - Click the web icon `</>`
   - Copy the `firebaseConfig` object

## Step 2: Configure Your App (2 minutes)

1. Open `src/services/firebase.js`
2. Replace the placeholder config with your Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef",
};
```

## Step 3: Add Demo Data (5 minutes)

1. Go to Firebase Console → Firestore Database
2. Click "Start collection"
3. Collection ID: `cakeShops`
4. Click "Next"
5. Document ID: `shop1`
6. Add these fields:

| Field         | Type   | Value                               |
| ------------- | ------ | ----------------------------------- |
| name          | string | Sweet Treats Bakery                 |
| description   | string | Homemade cakes made with love       |
| logoUrl       | string | https://via.placeholder.com/100     |
| coverImageUrl | string | https://via.placeholder.com/800x300 |

7. Click "Save"

### Add a Cake

1. Click on the `shop1` document
2. Click "Start collection"
3. Collection ID: `cakes`
4. Document ID: `cake1`
5. Add fields:

| Field       | Type   | Value                           |
| ----------- | ------ | ------------------------------- |
| name        | string | Chocolate Cake                  |
| description | string | Rich chocolate cake             |
| basePrice   | number | 500                             |
| imageUrl    | string | https://via.placeholder.com/400 |

6. Click "Save"

### Add Customizer Options

1. Go back to `shop1` document
2. Click "Start collection"
3. Collection ID: `options`
4. Document ID: `customizer`
5. Add field:
   - Field: `bases`
   - Type: `array`
   - Values: Add these strings:
     - Chocolate
     - Vanilla
     - Red Velvet
     - Ube
6. Add another field:
   - Field: `sizes`
   - Type: `map`
   - Add these key-value pairs:
     - `6-inch`: 500 (number)
     - `8-inch`: 700 (number)
     - `10-inch`: 1000 (number)
7. Add another field:
   - Field: `toppings`
   - Type: `array`
   - Click "Add item" → select `map`
   - Add these fields for each topping:
     - name: Strawberry (string)
     - price: 50 (number)
     - imageUrl: https://via.placeholder.com/80?text=🍓 (string)
   - Repeat for other toppings (Cherry, Chocolate Drip, etc.)

## Step 4: Run the App

```bash
npm run dev
```

**If you get Node version errors:**

- Download Node.js 20+ from https://nodejs.org/
- Install it
- Restart your terminal
- Try `npm run dev` again

## Step 5: Test the App

1. Open http://localhost:5173
2. You should see "Sweet Treats Bakery"
3. Click on it → you should see "Chocolate Cake"
4. Click "Customize" → drag toppings onto the cake
5. Click "Add to Cart"
6. Go to cart → checkout

## Step 6: Test Admin Dashboard

1. Go to http://localhost:5173/admin/shop1
2. Login with:
   - Email: `admin@test.com`
   - Password: `admin123`
3. You should see the admin dashboard
4. Place an order from the customer side
5. Refresh admin dashboard to see the order

## Troubleshooting

### "Shop not found"

- Make sure you created the `cakeShops` collection
- Check the document ID is exactly `shop1`

### "Customization not available"

- Make sure you created the `options/customizer` document
- Check all fields are spelled correctly

### Firebase errors

- Double-check your Firebase config
- Make sure Firestore is in Test mode
- Check Firebase Console for errors

### Drag & drop not working

- Use a mouse (not touch)
- Check browser console for errors
- Make sure you're on a modern browser

## Next Steps

- Replace placeholder images with real cake photos
- Add more shops and cakes
- Customize colors and styling
- Deploy to hosting (Vercel, Netlify, Firebase Hosting)

## Need Help?

Check the main README.md for detailed documentation!

**Happy coding! 🎂**
