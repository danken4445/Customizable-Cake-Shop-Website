# Migration Checklist: New Routing System

This checklist helps migrate from the old routing system to the new `/shop/:shopId/*` structure.

## ✅ Completed Changes

### Core Files Modified

- [x] **App.jsx** - Updated route definitions
  - Added `/onboarding` route
  - Added `/dashboard` route  
  - Changed all routes to `/shop/:shopId/*` pattern
  - Added `/shop/:shopId/track/:orderId` route

- [x] **shopUtils.js** - Simplified routing helpers
  - `getShopId()` now extracts from `/shop/:shopId` path
  - `getRoutePath(path, shopId)` builds shop-prefixed routes
  - Removed subdomain logic

- [x] **ShopContext.jsx** - URL-based shop detection
  - Uses `useLocation` hook
  - Extracts shopId from path segments
  - Handles routes without shopId

- [x] **Navbar.jsx** - Adaptive navigation
  - Shows different UI for shop vs platform pages
  - Added dropdown menu for global navigation
  - Conditional cart badge display

- [x] **Checkout.jsx** - Order tracking integration
  - Redirects to `/shop/:shopId/track/:orderId` after order
  - Improved order data structure
  - Added tracking URL in success message

### New Files Created

- [x] **Onboarding.jsx** - Shop creation page
  - Shop information form
  - Branding customization
  - Image upload functionality
  - Auto-generates default data

- [x] **OrderTracking.jsx** - Order status page
  - Displays order details
  - Shows progress bar
  - Customer & shop information
  - Contact details

- [x] **ROUTING_GUIDE.md** - Complete documentation
  - Route structure explanation
  - Technical implementation details
  - Firestore data structure
  - User flows & examples

- [x] **QUICK_REFERENCE.md** - Developer quick reference
  - Route map
  - Code snippets
  - Common patterns
  - Firebase paths

- [x] **PROJECT_STRUCTURE.md** - Project overview
  - Directory structure
  - File descriptions
  - Technology stack
  - Getting started guide

## 🔍 Testing Checklist

### Before Deploying

- [ ] Test onboarding flow
  - [ ] Create new shop
  - [ ] Upload logo and cover images
  - [ ] Verify shop appears in Firestore
  - [ ] Redirect to shop storefront works

- [ ] Test shop storefront
  - [ ] Visit `/shop/:shopId`
  - [ ] Shop branding displays correctly
  - [ ] Cakes load from Firestore
  - [ ] Click cake navigates to customizer

- [ ] Test customization flow
  - [ ] Drag toppings onto cake
  - [ ] Select base and size
  - [ ] Price calculates correctly
  - [ ] Add to cart works

- [ ] Test cart
  - [ ] Items display correctly
  - [ ] Remove item works
  - [ ] Total price is accurate
  - [ ] Proceed to checkout works

- [ ] Test checkout
  - [ ] Form validation works
  - [ ] Pickup/delivery toggle works
  - [ ] Order submits to Firestore
  - [ ] Redirects to tracking page

- [ ] Test order tracking
  - [ ] Order details display
  - [ ] Status shown correctly
  - [ ] Customer info visible
  - [ ] Shop contact info shown

- [ ] Test navigation
  - [ ] Navbar shows correct items per page type
  - [ ] Cart badge updates
  - [ ] Dropdown menu works
  - [ ] All links navigate correctly

- [ ] Test admin dashboard
  - [ ] `/dashboard` loads
  - [ ] Authentication works
  - [ ] Orders display
  - [ ] Shop management works

## 🚀 Deployment Steps

### 1. Local Testing

```bash
# Start development server
npm run dev

# Test these URLs:
http://localhost:5173/onboarding
http://localhost:5173/dashboard
http://localhost:5173/shop/test-shop
http://localhost:5173/shop/test-shop/customize/cake-id
http://localhost:5173/shop/test-shop/cart
http://localhost:5173/shop/test-shop/checkout
http://localhost:5173/shop/test-shop/track/order-id
```

### 2. Build for Production

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

### 3. Firebase/Firestore Setup

- [ ] Ensure Firestore rules allow:
  - Public read for `cakeShops/{shopId}`
  - Public read/write for `cakeShops/{shopId}/orders`
  - Public read for `cakeShops/{shopId}/cakes`
  - Public read for `cakeShops/{shopId}/options`

Example Firestore rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /cakeShops/{shopId} {
      allow read: if true;
      allow write: if request.auth != null;
      
      match /cakes/{cakeId} {
        allow read: if true;
        allow write: if request.auth != null;
      }
      
      match /options/{optionId} {
        allow read: if true;
        allow write: if request.auth != null;
      }
      
      match /orders/{orderId} {
        allow read: if true;
        allow create: if true;
        allow update: if request.auth != null;
        allow delete: if request.auth != null;
      }
    }
  }
}
```

### 4. Firebase Storage Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /shops/{shopId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### 5. Deploy to Hosting

Choose your platform:

#### Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

#### Netlify
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy

# Production deployment
netlify deploy --prod
```

#### Firebase Hosting
```bash
# Install Firebase CLI
npm i -g firebase-tools

# Login
firebase login

# Initialize (if not done)
firebase init hosting

# Deploy
firebase deploy --only hosting
```

## 🔗 Update External Links

If you have existing links pointing to shops:

### Old Format
```
https://yourdomain.com/cakeshopa
```

### New Format
```
https://yourdomain.com/shop/cakeshopa
```

### Update Locations
- [ ] Social media profiles
- [ ] Email signatures
- [ ] Marketing materials
- [ ] QR codes
- [ ] Business cards
- [ ] Third-party listings

## 📊 Analytics Updates

If using Google Analytics or similar:

- [ ] Update page tracking for new URLs
- [ ] Set up events for:
  - Shop creation (onboarding)
  - Cake customization
  - Cart additions
  - Checkout completions
  - Order tracking views

## 🔄 Backward Compatibility

### Redirects (Optional)

If you want to support old URLs, add redirects:

**Vercel** - `vercel.json`:
```json
{
  "redirects": [
    {
      "source": "/:shopId/customize/:cakeId",
      "destination": "/shop/:shopId/customize/:cakeId",
      "permanent": true
    },
    {
      "source": "/:shopId/cart",
      "destination": "/shop/:shopId/cart",
      "permanent": true
    }
  ]
}
```

**Netlify** - `_redirects` file:
```
/:shopId/customize/:cakeId  /shop/:shopId/customize/:cakeId  301
/:shopId/cart               /shop/:shopId/cart               301
/:shopId/checkout           /shop/:shopId/checkout           301
```

## 🐛 Common Issues & Solutions

### Issue: Shop not found
**Solution**: 
- Check shopId in URL matches Firestore document ID
- Verify Firestore rules allow public read
- Check console for errors

### Issue: Images not uploading
**Solution**:
- Check Firebase Storage rules
- Verify authentication for upload
- Check file size limits

### Issue: Routes not working
**Solution**:
- Clear browser cache
- Check build output
- Verify router configuration
- Test in incognito mode

### Issue: Cart not persisting
**Solution**:
- Check localStorage is enabled
- Verify CartContext wraps App
- Check key name: `"cakeCart"`

## 📝 Post-Deployment

- [ ] Monitor error logs
- [ ] Test all routes in production
- [ ] Verify Firebase quota usage
- [ ] Check performance metrics
- [ ] Update documentation with production URLs
- [ ] Train shop owners on new URLs
- [ ] Create user guides

## 🎉 Migration Complete!

Once all checkboxes are completed, your migration is done. The new routing system provides:

✨ **Benefits:**
- Clearer URL structure
- Better multi-tenancy support
- Easier testing and development
- Order tracking capability
- Streamlined onboarding

📚 **Resources:**
- [ROUTING_GUIDE.md](ROUTING_GUIDE.md) - Complete routing docs
- [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - Quick reference
- [PROJECT_STRUCTURE.md](../PROJECT_STRUCTURE.md) - Project overview

## 🆘 Need Help?

If you encounter issues:
1. Check the documentation files
2. Review console errors
3. Verify Firebase setup
4. Test in development first
5. Check Firestore data structure
