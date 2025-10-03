# Role-Based Access Control (RBAC) Guide

This document explains the RBAC system implemented in the Multi-Shop Cake Platform.

## Overview

The platform has **two admin roles**:
1. **Super Admin** - Platform owner with full access
2. **Admin** - Shop manager with limited access to assigned shops

## Roles & Permissions

### Super Admin
**Access Level**: Platform-wide

**Permissions**:
- ✅ Create new shops
- ✅ View all shops
- ✅ Activate/Deactivate shops
- ✅ Delete shops
- ✅ Create admin accounts
- ✅ Assign admins to shops
- ✅ Delete admin accounts
- ✅ View admin list
- ✅ Access all shop management features

**Routes**:
- `/admin/dashboard` - Super admin dashboard (shops & admins management)
- `/onboarding` - Create new shops
- `/shop/:shopId` - View any shop storefront
- `/dashboard` - Manage any shop

### Admin
**Access Level**: Assigned shops only

**Permissions**:
- ✅ View assigned shops
- ✅ Manage assigned shops (cakes, orders, customization)
- ✅ View assigned shop storefronts
- ❌ Create new shops
- ❌ Delete shops
- ❌ Create other admins
- ❌ Access shops not assigned to them

**Routes**:
- `/admin/my-shops` - List of assigned shops
- `/dashboard?shopId=X` - Manage specific shop (only if assigned)
- `/shop/:shopId` - View assigned shop storefront

## Authentication Flow

### 1. Login Process
1. User visits `/admin/login`
2. Enters email & password
3. Firebase Authentication validates credentials
4. **AuthContext** checks user role:
   - Looks for `superAdmin` custom claim
   - If not super admin, checks `admins` collection in Firestore
5. User redirected based on role:
   - Super Admin → `/admin/dashboard`
   - Admin → `/admin/my-shops`

### 2. Route Protection
All admin routes use `<ProtectedRoute>` component:

```jsx
<ProtectedRoute requiredRole="superAdmin">
  <SuperAdminDashboard />
</ProtectedRoute>
```

**Protection logic**:
- Not authenticated → Redirect to `/admin/login`
- Wrong role → Show "Access Denied" message
- Shop-specific access → Check if admin has permission for that shop

## Firebase Structure

### Custom Claims (Super Admin)
Set via Firebase Admin SDK:
```javascript
admin.auth().setCustomUserClaims(uid, { superAdmin: true });
```

**Location**: Firebase Authentication custom claims

### Admins Collection (Regular Admins)
**Path**: `admins/{uid}`

**Document structure**:
```javascript
{
  email: "admin@example.com",
  assignedShops: ["shop1", "shop2", "shop3"],
  createdAt: "2025-10-04T00:00:00Z",
  createdBy: "superAdminUID"
}
```

## How to Create Users

### Create Super Admin

1. **Create Firebase Auth user**:
   - Firebase Console → Authentication → Add user
   - Or use the setup script

2. **Set custom claim**:
   ```bash
   node scripts/set-super-admin.js
   ```
   
   See `docs/SUPER_ADMIN_SETUP.md` for details.

### Create Admin (via Super Admin Dashboard)

1. Login as super admin
2. Go to `/admin/dashboard`
3. Click "Admins" tab
4. Click "+ Create New Admin"
5. Enter:
   - Email
   - Password
   - Select shops to assign
6. Click "Create Admin"

The system will:
- Create Firebase Auth user
- Create document in `admins` collection
- Assign selected shops

## Code Components

### AuthContext (`src/context/AuthContext.jsx`)
- Manages authentication state
- Detects user role (superAdmin/admin)
- Provides helper functions:
  - `hasAccessToShop(shopId)` - Check shop access
  - `isSuperAdmin` - Boolean flag
  - `isAdmin` - Boolean flag
  - `signOut()` - Logout function

### ProtectedRoute (`src/components/ProtectedRoute.jsx`)
- Wraps protected pages
- Checks authentication
- Validates role permissions
- Validates shop-specific access

### SuperAdminDashboard (`src/pages/SuperAdminDashboard.jsx`)
- Tabs for Shops and Admins
- Shop management (view, activate, delete)
- Admin management (create, assign, delete)
- Statistics cards

### AdminShops (`src/pages/AdminShops.jsx`)
- Shows only assigned shops
- Quick access to shop management
- View shop storefront

### AdminLogin (`src/pages/AdminLogin.jsx`)
- Unified login for both roles
- Auto-redirects based on role
- Error handling

## Example Usage

### Check if user can access a shop
```javascript
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { hasAccessToShop } = useAuth();
  
  if (hasAccessToShop('shop123')) {
    // Show shop management UI
  } else {
    // Show access denied
  }
}
```

### Protect a route
```jsx
<Route
  path="/admin/dashboard"
  element={
    <ProtectedRoute requiredRole="superAdmin">
      <SuperAdminDashboard />
    </ProtectedRoute>
  }
/>
```

### Get current user role
```javascript
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { userRole, isSuperAdmin, isAdmin } = useAuth();
  
  if (isSuperAdmin) {
    return <div>You have full access!</div>;
  }
  
  if (isAdmin) {
    return <div>You can manage your assigned shops</div>;
  }
}
```

## Security Notes

### ⚠️ Important Limitations

1. **Admin Creation**: Currently creates users directly in client-side code. In production, move this to a Firebase Cloud Function with Admin SDK.

2. **Custom Claims**: Can only be set via Firebase Admin SDK (server-side). The setup script handles this.

3. **Firestore Rules**: Update rules to restrict admin document access:
   ```javascript
   match /admins/{uid} {
     allow read: if request.auth.uid == uid || request.auth.token.superAdmin == true;
     allow write: if request.auth.token.superAdmin == true;
   }
   ```

4. **Shop Access**: Regular admins can view any shop storefront (public). They can only MANAGE shops assigned to them.

## Testing

### Test Super Admin
1. Run `node scripts/set-super-admin.js`
2. Login at `/admin/login`
3. Should see Super Admin Dashboard
4. Can create shops and admins

### Test Admin
1. Create admin via super admin dashboard
2. Assign shops
3. Logout
4. Login as the new admin
5. Should see "My Shops" page
6. Can only manage assigned shops

## Troubleshooting

### "Access Denied" after login
- Check if user exists in Firebase Authentication
- For super admin: Verify custom claim is set
- For admin: Verify document exists in `admins` collection

### Admin can't access assigned shop
- Check `assignedShops` array in admin document
- Verify shop ID matches exactly

### Can't create admin
- Ensure logged in as super admin
- Check console for errors
- Verify Firebase Auth allows email/password

## Related Files

- `src/context/AuthContext.jsx` - Authentication state management
- `src/components/ProtectedRoute.jsx` - Route protection
- `src/pages/SuperAdminDashboard.jsx` - Super admin UI
- `src/pages/AdminShops.jsx` - Admin shop list
- `src/pages/AdminLogin.jsx` - Login page
- `src/App.jsx` - Route configuration
- `scripts/set-super-admin.js` - Super admin setup script

## Next Steps

For production deployment:

1. **Move admin creation to Cloud Function**:
   ```javascript
   exports.createAdmin = functions.https.onCall(async (data, context) => {
     // Verify caller is super admin
     if (!context.auth.token.superAdmin) {
       throw new functions.https.HttpsError('permission-denied');
     }
     
     // Create user with Admin SDK
     const user = await admin.auth().createUser({
       email: data.email,
       password: data.password
     });
     
     // Create Firestore document
     await admin.firestore().collection('admins').doc(user.uid).set({
       email: data.email,
       assignedShops: data.assignedShops
     });
   });
   ```

2. **Update Firestore Security Rules** (see above)

3. **Add email verification** for new admins

4. **Add password reset** functionality

5. **Add audit logging** for admin actions
