/**
 * FIREBASE SEED DATA GUIDE
 * 
 * This file contains JSON structures to manually add to your Firestore database.
 * Use the Firebase Console to create these documents.
 */

// ============================================
// 1. CREATE A SHOP
// ============================================
// Collection: cakeShops
// Document ID: shop1
{
  "name": "Sweet Treats Bakery",
  "description": "Homemade cakes and pastries made with love",
  "logoUrl": "https://via.placeholder.com/100?text=STB",
  "coverImageUrl": "https://via.placeholder.com/800x300?text=Sweet+Treats+Bakery"
}

// ============================================
// 2. ADD CAKES TO THE SHOP
// ============================================
// Collection: cakeShops/shop1/cakes
// Document ID: cake1
{
  "name": "Chocolate Fudge Cake",
  "description": "Rich and moist chocolate cake with layers of fudge",
  "basePrice": 500,
  "imageUrl": "https://via.placeholder.com/400x400?text=Chocolate+Cake"
}

// Document ID: cake2
{
  "name": "Vanilla Dream Cake",
  "description": "Light and fluffy vanilla cake with cream frosting",
  "basePrice": 450,
  "imageUrl": "https://via.placeholder.com/400x400?text=Vanilla+Cake"
}

// Document ID: cake3
{
  "name": "Red Velvet Delight",
  "description": "Classic red velvet cake with cream cheese frosting",
  "basePrice": 550,
  "imageUrl": "https://via.placeholder.com/400x400?text=Red+Velvet"
}

// ============================================
// 3. ADD CUSTOMIZER OPTIONS
// ============================================
// Collection: cakeShops/shop1/options
// Document ID: customizer
{
  "bases": [
    "Chocolate",
    "Vanilla",
    "Red Velvet",
    "Ube",
    "Mocha",
    "Carrot"
  ],
  "sizes": {
    "6-inch": 500,
    "8-inch": 700,
    "10-inch": 1000,
    "12-inch": 1500
  },
  "toppings": [
    {
      "name": "Strawberry",
      "price": 50,
      "imageUrl": "https://via.placeholder.com/80?text=🍓"
    },
    {
      "name": "Cherry",
      "price": 50,
      "imageUrl": "https://via.placeholder.com/80?text=🍒"
    },
    {
      "name": "Blueberry",
      "price": 50,
      "imageUrl": "https://via.placeholder.com/80?text=🫐"
    },
    {
      "name": "Chocolate Drip",
      "price": 75,
      "imageUrl": "https://via.placeholder.com/80?text=🍫"
    },
    {
      "name": "Caramel Drizzle",
      "price": 75,
      "imageUrl": "https://via.placeholder.com/80?text=🍯"
    },
    {
      "name": "Whipped Cream",
      "price": 30,
      "imageUrl": "https://via.placeholder.com/80?text=🍦"
    },
    {
      "name": "Sprinkles",
      "price": 20,
      "imageUrl": "https://via.placeholder.com/80?text=✨"
    },
    {
      "name": "Oreo Crumbs",
      "price": 60,
      "imageUrl": "https://via.placeholder.com/80?text=🍪"
    }
  ]
}

// ============================================
// 4. CREATE ADMIN USER (Firebase Authentication)
// ============================================
/**
 * 1. Go to Firebase Console → Authentication
 * 2. Click "Add User"
 * 3. Email: admin@sweettreats.com
 * 4. Password: (create a secure password)
 * 
 * Use these credentials to login at /admin/shop1
 */

// ============================================
// 5. OPTIONAL: ADD MORE SHOPS
// ============================================
// Collection: cakeShops
// Document ID: shop2
{
  "name": "Cake Paradise",
  "description": "Premium custom cakes for every occasion",
  "logoUrl": "https://via.placeholder.com/100?text=CP",
  "coverImageUrl": "https://via.placeholder.com/800x300?text=Cake+Paradise"
}

// Then repeat steps 2-3 for shop2

// ============================================
// NOTES
// ============================================
/**
 * - Replace placeholder images with real cake images
 * - Upload images to Firebase Storage and get URLs
 * - You can add as many shops, cakes, and toppings as needed
 * - Each shop should have its own admin account
 * - Prices are in Philippine Pesos (₱)
 */
