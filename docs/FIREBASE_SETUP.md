# 🌱 Firebase Seed Data Guide

This guide shows you how to add demo data to your Firebase Firestore database.

## 📋 Step-by-Step Instructions

### 1. Go to Firebase Console

1. Open https://console.firebase.google.com/
2. Select your project: **posapplication-36ef9**
3. Click **Firestore Database** in left sidebar

### 2. Create Collection: cakeShops

#### Step 2.1: Start Collection

- Click **"Start collection"** (or **"+"** if you have data)
- Collection ID: `cakeShops`
- Click **"Next"**

#### Step 2.2: Add First Shop (shop1)

- Document ID: `shop1`
- Add the following fields:

| Field Name      | Type   | Value                                                          |
| --------------- | ------ | -------------------------------------------------------------- |
| `name`          | string | `Sweet Treats Bakery`                                          |
| `description`   | string | `Homemade cakes and pastries made with love`                   |
| `logoUrl`       | string | `https://via.placeholder.com/100?text=STB`                     |
| `coverImageUrl` | string | `https://via.placeholder.com/800x300?text=Sweet+Treats+Bakery` |

- Click **"Save"**

---

### 3. Add Cakes Subcollection

#### Step 3.1: Start Subcollection

- Click on the **shop1** document you just created
- Click **"Start collection"**
- Collection ID: `cakes`
- Click **"Next"**

#### Step 3.2: Add Cake 1

- Document ID: `cake1`
- Add fields:

| Field Name    | Type   | Value                                                     |
| ------------- | ------ | --------------------------------------------------------- |
| `name`        | string | `Chocolate Fudge Cake`                                    |
| `description` | string | `Rich and moist chocolate cake with layers of fudge`      |
| `basePrice`   | number | `500`                                                     |
| `imageUrl`    | string | `https://via.placeholder.com/400x400?text=Chocolate+Cake` |

- Click **"Save"**

#### Step 3.3: Add Cake 2 (Optional)

- In the **cakes** collection, click **"Add document"**
- Document ID: `cake2`
- Add fields:

| Field Name    | Type   | Value                                                   |
| ------------- | ------ | ------------------------------------------------------- |
| `name`        | string | `Vanilla Dream Cake`                                    |
| `description` | string | `Light and fluffy vanilla cake with cream frosting`     |
| `basePrice`   | number | `450`                                                   |
| `imageUrl`    | string | `https://via.placeholder.com/400x400?text=Vanilla+Cake` |

- Click **"Save"**

#### Step 3.4: Add Cake 3 (Optional)

- In the **cakes** collection, click **"Add document"**
- Document ID: `cake3`
- Add fields:

| Field Name    | Type   | Value                                                 |
| ------------- | ------ | ----------------------------------------------------- |
| `name`        | string | `Red Velvet Delight`                                  |
| `description` | string | `Classic red velvet cake with cream cheese frosting`  |
| `basePrice`   | number | `550`                                                 |
| `imageUrl`    | string | `https://via.placeholder.com/400x400?text=Red+Velvet` |

- Click **"Save"**

---

### 4. Add Customizer Options

#### Step 4.1: Start Subcollection

- Go back to **shop1** document (click back arrow or navigate in breadcrumb)
- Click **"Start collection"**
- Collection ID: `options`
- Click **"Next"**

#### Step 4.2: Create Customizer Document

- Document ID: `customizer`

#### Step 4.3: Add Bases (Array)

- Click **"Add field"**
- Field name: `bases`
- Type: **array**
- Add these items (click "Add item" for each):
  1. `Chocolate` (string)
  2. `Vanilla` (string)
  3. `Red Velvet` (string)
  4. `Ube` (string)
  5. `Mocha` (string)
  6. `Carrot` (string)

#### Step 4.4: Add Sizes (Map)

- Click **"Add field"**
- Field name: `sizes`
- Type: **map**
- Add these key-value pairs:
  - Key: `6-inch` → Value: `500` (number)
  - Key: `8-inch` → Value: `700` (number)
  - Key: `10-inch` → Value: `1000` (number)
  - Key: `12-inch` → Value: `1500` (number)

#### Step 4.5: Add Toppings (Array of Maps)

- Click **"Add field"**
- Field name: `toppings`
- Type: **array**

For each topping:

1. Click **"Add item"** → Select **"map"**
2. Add these fields:

**Topping 1: Strawberry**

- `name`: `Strawberry` (string)
- `price`: `50` (number)
- `imageUrl`: `https://via.placeholder.com/80?text=🍓` (string)

**Topping 2: Cherry**

- `name`: `Cherry` (string)
- `price`: `50` (number)
- `imageUrl`: `https://via.placeholder.com/80?text=🍒` (string)

**Topping 3: Blueberry**

- `name`: `Blueberry` (string)
- `price`: `50` (number)
- `imageUrl`: `https://via.placeholder.com/80?text=🫐` (string)

**Topping 4: Chocolate Drip**

- `name`: `Chocolate Drip` (string)
- `price`: `75` (number)
- `imageUrl`: `https://via.placeholder.com/80?text=🍫` (string)

**Topping 5: Caramel Drizzle**

- `name`: `Caramel Drizzle` (string)
- `price`: `75` (number)
- `imageUrl`: `https://via.placeholder.com/80?text=🍯` (string)

**Topping 6: Whipped Cream**

- `name`: `Whipped Cream` (string)
- `price`: `30` (number)
- `imageUrl`: `https://via.placeholder.com/80?text=🍦` (string)

**Topping 7: Sprinkles**

- `name`: `Sprinkles` (string)
- `price`: `20` (number)
- `imageUrl`: `https://via.placeholder.com/80?text=✨` (string)

**Topping 8: Oreo Crumbs**

- `name`: `Oreo Crumbs` (string)
- `price`: `60` (number)
- `imageUrl`: `https://via.placeholder.com/80?text=🍪` (string)

- Click **"Save"**

---

### 5. Enable Authentication

#### Step 5.1: Set Up Email/Password Auth

1. In Firebase Console, click **"Authentication"**
2. Click **"Get started"** (if first time)
3. Click **"Email/Password"**
4. Toggle **"Enable"**
5. Click **"Save"**

#### Step 5.2: Create Admin User

1. Click **"Users"** tab
2. Click **"Add user"**
3. Email: `admin@test.com` (or your email)
4. Password: Create a strong password (remember it!)
5. Click **"Add user"**

**Save these credentials!** You'll need them to login at `/admin/shop1`

---

## ✅ Verification Checklist

After adding data, verify:

- [ ] `cakeShops` collection exists
- [ ] `shop1` document has 4 fields (name, description, logoUrl, coverImageUrl)
- [ ] `shop1/cakes` has at least 1 cake with 4 fields
- [ ] `shop1/options/customizer` has 3 fields (bases, sizes, toppings)
- [ ] Authentication is enabled
- [ ] Admin user is created

---

## 🧪 Test Your Data

1. Go to your app: http://localhost:5174
2. You should see **"Sweet Treats Bakery"** on the landing page
3. Click on it
4. You should see the cakes you added
5. Click **"Customize"** on a cake
6. You should see bases, sizes, and toppings
7. Test drag-and-drop!

---

## 🔄 Add More Shops (Optional)

To add another shop, repeat the process:

1. In `cakeShops` collection, click **"Add document"**
2. Document ID: `shop2`
3. Add shop fields (name, description, logoUrl, coverImageUrl)
4. Add `cakes` subcollection with cakes
5. Add `options/customizer` with bases, sizes, toppings
6. Create admin user for shop2

---

## 🎨 Using Real Images

### Option 1: Firebase Storage

1. Go to **Storage** in Firebase Console
2. Create folders: `shops/shop1/cakes/`
3. Upload your cake images
4. Click on image → Copy download URL
5. Update `imageUrl` in Firestore

### Option 2: External URLs

Use any image hosting service (Imgur, Cloudinary, etc.)

---

## 🐛 Troubleshooting

### "Shop not found" in app

- Verify `cakeShops` collection name is exactly spelled
- Verify `shop1` document exists
- Check browser console for errors

### "Customization not available"

- Verify `options/customizer` document exists
- Check all fields are present (bases, sizes, toppings)
- Verify data types are correct

### Can't login as admin

- Verify user was created in Authentication
- Check email/password are correct
- Try resetting password in Firebase Console

---

## 📊 Final Structure

Your Firestore should look like:

```
cakeShops/
  └── shop1/
      ├── name: "Sweet Treats Bakery"
      ├── description: "..."
      ├── logoUrl: "..."
      ├── coverImageUrl: "..."
      ├── cakes/
      │   ├── cake1/
      │   │   ├── name: "Chocolate Fudge Cake"
      │   │   ├── basePrice: 500
      │   │   └── ...
      │   └── cake2/
      │       └── ...
      └── options/
          └── customizer/
              ├── bases: [...]
              ├── sizes: {...}
              └── toppings: [...]
```

---

**Done! Your data is ready! 🎉**

Now refresh your app and see your cake shop in action!
