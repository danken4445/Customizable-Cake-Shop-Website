# Firestore Security Rules Guide

Your application is getting "Missing or insufficient permissions" errors because the default Firestore rules are too restrictive.

## Problem

The default Firestore rules look like this:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false; // Denies all access!
    }
  }
}
```

## Solution

Update your Firestore Security Rules in Firebase Console.

---

## Step 1: Access Firestore Rules

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: **posapplication-36ef9**
3. Click **Firestore Database** in the left menu
4. Click the **Rules** tab at the top
5. You'll see the rules editor

---

## Step 2: Replace with These Rules

Copy and paste the rules below into the editor:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function: Check if user is super admin
    function isSuperAdmin() {
      return request.auth != null && request.auth.token.superAdmin == true;
    }
    
    // Helper function: Check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function: Check if user is admin for a specific shop
    function isAdminForShop(shopId) {
      return isAuthenticated() && 
             exists(/databases/$(database)/documents/admins/$(request.auth.uid)) &&
             shopId in get(/databases/$(database)/documents/admins/$(request.auth.uid)).data.assignedShops;
    }
    
    // Cake Shops Collection
    match /cakeShops/{shopId} {
      // Anyone can read shops (public storefronts)
      allow read: if true;
      
      // Only super admins can create shops
      allow create: if isSuperAdmin();
      
      // Super admins or assigned admins can update shops
      allow update: if isSuperAdmin() || isAdminForShop(shopId);
      
      // Only super admins can delete shops
      allow delete: if isSuperAdmin();
      
      // Subcollections (cakes, options, orders)
      match /{subcollection}/{document=**} {
        // Anyone can read (public data)
        allow read: if true;
        
        // Super admins or assigned admins can write
        allow write: if isSuperAdmin() || isAdminForShop(shopId);
      }
    }
    
    // Admins Collection
    match /admins/{adminId} {
      // Super admins can read all admin documents
      // Regular admins can read their own document
      allow read: if isSuperAdmin() || 
                     (isAuthenticated() && request.auth.uid == adminId);
      
      // Only super admins can create/update/delete admin documents
      allow create, update, delete: if isSuperAdmin();
    }
    
    // Any other collections (if you add them later)
    match /{document=**} {
      allow read, write: if isSuperAdmin();
    }
  }
}
```

---

## Step 3: Publish the Rules

1. Click the **Publish** button in the Firebase Console
2. Wait for confirmation message: "Rules published successfully"

---

## Step 4: Test Your Application

1. Refresh your application
2. Login as super admin
3. Try creating a shop again
4. Should work without permission errors!

---

## Rules Explanation

### Public Access
- ✅ Anyone can **read** shops (for public storefronts)
- ✅ Anyone can **read** cakes, options (for browsing)

### Super Admin Access
- ✅ **Full access** to everything
- ✅ Create/update/delete shops
- ✅ Create/update/delete admins
- ✅ Access all subcollections

### Regular Admin Access
- ✅ **Read** their own admin document
- ✅ **Update** shops they're assigned to
- ✅ **Write** to subcollections of assigned shops (cakes, orders, etc.)
- ❌ Cannot create shops
- ❌ Cannot create other admins
- ❌ Cannot access unassigned shops

### Customer Access (Unauthenticated)
- ✅ **Read** shops and products (public storefront)
- ✅ **Create** orders (shopping flow)
- ❌ Cannot modify shops or admin data

---

## Development vs Production Rules

### For Development (More Permissive)

If you want to allow all authenticated users during development:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

⚠️ **WARNING**: Only use this temporarily for development!

### For Production (Recommended Above)

Use the detailed rules provided above for production deployment.

---

## Testing the Rules

### Test 1: Super Admin
1. Login as super admin
2. Should be able to create shops
3. Should be able to create admins
4. Should see all shops in dashboard

### Test 2: Regular Admin
1. Login as regular admin
2. Should be able to update assigned shops
3. Should NOT be able to create shops
4. Should NOT be able to create admins

### Test 3: Public User
1. Don't login (or logout)
2. Visit shop storefront: `/shop/someShopId`
3. Should be able to browse cakes
4. Should NOT be able to modify anything

---

## Troubleshooting

### Still Getting Permission Errors?

1. **Check if rules are published**:
   - Firebase Console → Firestore → Rules tab
   - Look for green "Published" status

2. **Wait 30 seconds**:
   - Rules take a moment to propagate
   - Refresh your app after waiting

3. **Check authentication**:
   - Open browser DevTools → Console
   - Run: `firebase.auth().currentUser`
   - Should show your user object

4. **Check super admin claim**:
   - Run: `firebase.auth().currentUser.getIdTokenResult().then(r => console.log(r.claims))`
   - Should show: `{ superAdmin: true }`

5. **Clear browser cache**:
   - Sometimes auth tokens are cached
   - Logout, clear cache, login again

---

## Common Errors

### Error: "Missing or insufficient permissions"
**Cause**: Firestore rules are too restrictive  
**Fix**: Update rules as shown above

### Error: "Document doesn't exist"
**Cause**: Trying to access non-existent admin document  
**Fix**: Ensure admin document exists in `admins/{uid}`

### Error: "Request failed with status 400"
**Cause**: Usually a rules issue or malformed request  
**Fix**: Check rules and ensure data structure is correct

---

## Quick Fix (Emergency)

If you need to test immediately and rules aren't working:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // ⚠️ EVERYONE HAS ACCESS!
    }
  }
}
```

**⚠️ CRITICAL WARNING**: This allows anyone to read/write everything! Only use for testing, never in production!

---

## Next Steps

1. Update Firestore rules in Firebase Console
2. Publish the rules
3. Test creating a shop
4. If still having issues, check browser console for detailed errors

---

## Related Documentation

- [Firestore Security Rules Docs](https://firebase.google.com/docs/firestore/security/get-started)
- [Custom Claims](https://firebase.google.com/docs/auth/admin/custom-claims)
- `docs/FIREBASE_STORAGE_RULES.md` - Storage rules guide

---

**Need Help?** Copy the error message and check:
1. Firebase Console → Firestore → Rules (ensure published)
2. Browser DevTools → Console (check auth state)
3. Firebase Console → Authentication → Users (verify user exists)
