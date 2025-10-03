# RBAC Quick Start Guide

## 🚀 Quick Setup (First Time)

### Step 1: Create Your Super Admin Account

```bash
# 1. Download service account key from Firebase Console
# 2. Save as scripts/serviceAccountKey.json
# 3. Run the setup script
node scripts/set-super-admin.js
```

### Step 2: Login as Super Admin

1. Go to: `http://localhost:5173/admin/login`
2. Email: Your super admin email
3. Password: Your super admin password
4. You'll be redirected to `/admin/dashboard`

### Step 3: Create Your First Shop

1. In Super Admin Dashboard, click "🏪 Shops" tab
2. Click "+ Create New Shop" (or go to `/onboarding`)
3. Fill in shop details (name, logo, cover image)
4. Click "Create Shop"

### Step 4: Create Shop Admin

1. In Super Admin Dashboard, click "👥 Admins" tab
2. Click "+ Create New Admin"
3. Enter:
   - Email: `shopadmin@example.com`
   - Password: Strong password
   - Select shops to assign
4. Click "Create Admin"

### Step 5: Test Admin Access

1. Logout (click your email → Logout)
2. Login as shop admin
3. You'll see "My Shops" page
4. Click "Manage Shop" to access shop dashboard

## 📋 Daily Usage

### As Super Admin

**Login**: `/admin/login` → Redirects to `/admin/dashboard`

**Main Tasks**:
- Create shops: Click "Shops" tab → "+ Create New Shop"
- Manage shops: View, Activate/Deactivate, Delete
- Create admins: Click "Admins" tab → "+ Create New Admin"
- Assign shops to admins: Select shops when creating admin

**Navigation**:
- Dashboard: View stats, manage shops & admins
- Create Shop: Quick access to onboarding
- Logout: From user menu (click email)

### As Shop Admin

**Login**: `/admin/login` → Redirects to `/admin/my-shops`

**Main Tasks**:
- View assigned shops
- Manage shop: Click "Manage Shop" button
- View storefront: Click "View Storefront" button

**Navigation**:
- My Shops: List of shops you manage
- Dashboard: Manage specific shop (cakes, orders, etc.)
- Logout: From user menu (click email)

## 🔐 Access Control Matrix

| Feature | Super Admin | Admin |
|---------|------------|-------|
| View all shops | ✅ | ❌ |
| Create shops | ✅ | ❌ |
| Delete shops | ✅ | ❌ |
| Activate/Deactivate shops | ✅ | ❌ |
| Create admins | ✅ | ❌ |
| Assign shops to admins | ✅ | ❌ |
| View assigned shops | ✅ | ✅ |
| Manage assigned shops | ✅ | ✅ |
| View shop storefront | ✅ | ✅ |

## 🌐 Route Reference

### Public Routes
- `/admin/login` - Login page for all admins

### Super Admin Only
- `/admin/dashboard` - Super admin dashboard
- `/onboarding` - Create new shop

### Regular Admin Only
- `/admin/my-shops` - List of assigned shops

### Both Roles
- `/dashboard` - Shop management (if has access to shop)
- `/shop/:shopId` - Public shop storefront

## 💡 Common Workflows

### Workflow 1: Onboard New Shop Owner

1. **Super Admin** creates shop via `/onboarding`
2. **Super Admin** creates admin account
3. **Super Admin** assigns new shop to new admin
4. **New Admin** receives credentials
5. **New Admin** logs in and manages their shop

### Workflow 2: Assign Existing Admin to New Shop

1. **Super Admin** creates new shop
2. **Super Admin** goes to Admins tab
3. Currently: Delete and recreate admin with new shop list
4. (Future: Add "Edit Admin" feature)

### Workflow 3: Remove Admin Access

1. **Super Admin** goes to Admins tab
2. Click "Delete" on admin row
3. Confirm deletion
4. Admin can no longer login

## 🛠️ Troubleshooting

### Problem: "Access Denied" after login

**For Super Admin**:
1. Check if custom claim is set: Run `node scripts/set-super-admin.js`
2. Logout and login again (claims are cached)

**For Regular Admin**:
1. Check if document exists in Firestore: `admins/{uid}`
2. Verify email matches
3. Ask super admin to recreate your account

### Problem: Admin can't see their shop

1. Check `assignedShops` array in admin document
2. Verify shop ID is correct
3. Super admin should delete and recreate admin with correct shops

### Problem: Can't create admin

1. Ensure you're logged in as super admin
2. Check browser console for errors
3. Verify Firebase Auth allows email/password
4. Ensure password is at least 6 characters

### Problem: Forgot password

**Current**: No password reset feature
**Workaround**: Super admin must delete and recreate account

**Future**: Implement password reset flow

## 📱 Mobile/Responsive

All admin pages are fully responsive:
- Dashboard works on mobile
- Tables scroll horizontally on small screens
- Forms adapt to screen size

## 🔒 Security Best Practices

1. **Use strong passwords**: Min 12 characters, mixed case, numbers, symbols
2. **Don't share credentials**: Each admin should have their own account
3. **Regular audits**: Review admin list periodically
4. **Remove unused admins**: Delete accounts that are no longer needed
5. **Secure service account key**: Never commit `serviceAccountKey.json` to Git

## 📚 Related Documentation

- `RBAC_GUIDE.md` - Complete RBAC system documentation
- `SUPER_ADMIN_SETUP.md` - Detailed super admin setup guide
- `FIREBASE_STORAGE_RULES.md` - Firebase Storage configuration
- `QUICKSTART_WHITELABEL.md` - White-label platform guide

## ❓ FAQ

**Q: Can an admin manage multiple shops?**
A: Yes! Super admin can assign multiple shops when creating the admin.

**Q: Can a shop have multiple admins?**
A: Yes! Super admin can assign the same shop to multiple admins.

**Q: Can an admin create other admins?**
A: No, only super admins can create and manage admin accounts.

**Q: Can an admin see shops they're not assigned to?**
A: They can view the public storefront, but cannot manage them.

**Q: How do I change an admin's assigned shops?**
A: Currently: Delete and recreate the admin. Future: Add edit functionality.

**Q: What happens if I delete a shop that has admins?**
A: Admins will still exist but won't have access to that shop anymore.

## 🎯 Next Steps

After setup:
1. ✅ Create shops
2. ✅ Create admins and assign shops
3. ✅ Add cakes to shops
4. ✅ Configure customization options
5. ✅ Test customer ordering flow
6. ✅ Deploy to production

## 🚀 Quick Commands

```bash
# Create super admin
node scripts/set-super-admin.js

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

**Need Help?** Check `docs/RBAC_GUIDE.md` for detailed information.
