# Super Admin Setup Guide

This guide explains how to create and configure super admin accounts for the Multi-Shop Cake Platform.

## What is a Super Admin?

A super admin has platform-wide access to:
- View all shops on the platform
- Activate/deactivate shops
- Delete shops and their data
- Monitor platform statistics
- Access any shop's storefront

Regular shop owners only have access to their own shop's admin dashboard.

## Prerequisites

- Node.js installed (v18 or higher)
- Firebase Admin SDK access
- Access to your Firebase project

## Step 1: Create a User in Firebase Authentication

### Option A: Firebase Console (Easiest)

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: **posapplication-36ef9**
3. Click **Authentication** in the left menu
4. Click the **Users** tab
5. Click **Add user** button
6. Enter:
   - **Email**: `admin@yourcompany.com` (or your preferred email)
   - **Password**: Create a strong password (min 6 characters)
7. Click **Add user**
8. **Copy the User UID** from the users list - you'll need this for Step 2

### Option B: Via Firebase Admin SDK

```javascript
const admin = require('firebase-admin');
const serviceAccount = require('./path/to/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function createSuperAdmin() {
  const userRecord = await admin.auth().createUser({
    email: 'admin@yourcompany.com',
    password: 'YourSecurePassword123!',
    emailVerified: true,
  });
  
  console.log('User created successfully!');
  console.log('User UID:', userRecord.uid);
  return userRecord.uid;
}

createSuperAdmin();
```

## Step 2: Set Super Admin Custom Claim

Custom claims **cannot** be set from client-side code. You must use Firebase Admin SDK (server-side).

### Setup Firebase Admin SDK

1. **Download Service Account Key**:
   - Go to Firebase Console → Project Settings → Service Accounts
   - Click "Generate new private key"
   - Save the JSON file securely (DO NOT commit to Git!)

2. **Create a Node.js script** in your project root:

Create file: `scripts/set-super-admin.js`

```javascript
const admin = require('firebase-admin');
const serviceAccount = require('../path/to/serviceAccountKey.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Replace with the actual User UID from Step 1
const userUID = 'PASTE_USER_UID_HERE';

async function setSuperAdminClaim() {
  try {
    // Set the custom claim
    await admin.auth().setCustomUserClaims(userUID, { 
      superAdmin: true 
    });
    
    console.log('✅ Super admin claim set successfully!');
    console.log('User UID:', userUID);
    console.log('The user must sign out and sign in again for changes to take effect.');
    
    // Verify the claim was set
    const user = await admin.auth().getUser(userUID);
    console.log('Custom claims:', user.customClaims);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting super admin claim:', error);
    process.exit(1);
  }
}

setSuperAdminClaim();
```

3. **Install Firebase Admin SDK** (if not already installed):

```bash
npm install firebase-admin
```

4. **Run the script**:

```bash
node scripts/set-super-admin.js
```

You should see:
```
✅ Super admin claim set successfully!
User UID: abc123...
Custom claims: { superAdmin: true }
```

## Step 3: Test Super Admin Login

1. **Navigate to Super Admin Login**:
   - Go to `http://localhost:5173/super-admin/login`
   - Or click "Menu" → "🔒 Super Admin" in the navbar

2. **Login with the credentials**:
   - Email: The email you created in Step 1
   - Password: The password you set in Step 1

3. **Verify Access**:
   - You should be redirected to `/super-admin/dashboard`
   - You should see all shops listed
   - You can view, activate/deactivate, and delete shops

## Important Security Notes

### DO NOT Commit Service Account Keys

Add to `.gitignore`:
```
serviceAccountKey.json
scripts/serviceAccountKey.json
```

### Production Security Recommendations

1. **Limit Super Admin Accounts**: Only create accounts for trusted personnel
2. **Use Strong Passwords**: Minimum 12 characters with mixed case, numbers, and symbols
3. **Enable 2FA**: Set up two-factor authentication in Firebase Console
4. **Monitor Activity**: Regularly check Firebase Authentication logs
5. **Rotate Credentials**: Change super admin passwords periodically

### Revoke Super Admin Access

To remove super admin privileges:

```javascript
const admin = require('firebase-admin');

async function revokeSuperAdmin(userUID) {
  await admin.auth().setCustomUserClaims(userUID, { 
    superAdmin: false 
  });
  console.log('Super admin access revoked for:', userUID);
}

revokeSuperAdmin('USER_UID_HERE');
```

## Alternative: Set Claim via Firebase Functions

For production environments, you can create a Cloud Function:

```javascript
// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

exports.setSuperAdmin = functions.https.onCall(async (data, context) => {
  // Only allow existing super admins to create new super admins
  if (!context.auth || !context.auth.token.superAdmin) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Only super admins can create other super admins.'
    );
  }

  const { uid } = data;
  
  await admin.auth().setCustomUserClaims(uid, { superAdmin: true });
  
  return { success: true, message: 'Super admin claim set' };
});
```

Deploy: `firebase deploy --only functions`

## Troubleshooting

### "Access denied" after login

- Make sure the custom claim was set successfully
- The user must **sign out and sign in again** after the claim is set
- Verify the claim with: `firebase.auth().currentUser.getIdTokenResult()`

### Cannot set custom claims

- Ensure you're using Firebase Admin SDK (server-side only)
- Check that the service account key has proper permissions
- Verify the User UID is correct

### Script errors

- Make sure `firebase-admin` is installed: `npm install firebase-admin`
- Check that the service account key path is correct
- Verify the JSON file is valid

## Quick Reference

### Create Super Admin (Full Process)

```bash
# 1. Create user in Firebase Console (copy UID)

# 2. Create script
mkdir -p scripts
# Create scripts/set-super-admin.js with code above

# 3. Install dependencies
npm install firebase-admin

# 4. Run script
node scripts/set-super-admin.js

# 5. Test login at /super-admin/login
```

## Support

If you encounter issues:
1. Check Firebase Console → Authentication → Users (verify user exists)
2. Check browser console for errors
3. Verify custom claims with `getIdTokenResult()`
4. Review Firebase Admin SDK logs

## Related Documentation

- [Firebase Custom Claims Documentation](https://firebase.google.com/docs/auth/admin/custom-claims)
- [Firebase Admin SDK Setup](https://firebase.google.com/docs/admin/setup)
- [Security Best Practices](https://firebase.google.com/docs/rules/basics)
