# Admin Creation Issue & Solution

## Problem

When creating an admin using `createUserWithEmailAndPassword()` in the client-side code, Firebase **automatically signs in as the newly created user**, which logs out the super admin.

This is a Firebase security feature - you cannot create users without being signed in as them (client-side).

## Current Workaround

The current implementation:
1. Warns the super admin before creating the admin
2. Creates the admin account
3. Creates the Firestore document
4. Signs out the new admin
5. Redirects super admin to login page
6. Super admin must log back in

**This works but is inconvenient!**

---

## Production Solution: Firebase Cloud Function

The **proper way** to create admin accounts is using Firebase Cloud Functions with the Admin SDK.

### Step 1: Install Firebase Functions

```bash
npm install -g firebase-tools
firebase login
firebase init functions
```

Select:
- JavaScript or TypeScript
- Install dependencies

### Step 2: Create the Cloud Function

Create/edit `functions/index.js`:

```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

/**
 * Cloud Function to create admin accounts
 * Only callable by super admins
 */
exports.createAdmin = functions.https.onCall(async (data, context) => {
  // 1. Verify caller is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to create admins.'
    );
  }

  // 2. Verify caller is a super admin
  const isSuperAdmin = context.auth.token.superAdmin === true;
  if (!isSuperAdmin) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Only super admins can create admin accounts.'
    );
  }

  // 3. Validate input
  const { email, password, assignedShops } = data;
  
  if (!email || !password) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Email and password are required.'
    );
  }

  if (!assignedShops || assignedShops.length === 0) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'At least one shop must be assigned.'
    );
  }

  try {
    // 4. Create the user using Admin SDK (doesn't sign them in!)
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
      emailVerified: false,
    });

    // 5. Create Firestore document for admin
    await admin.firestore().collection('admins').doc(userRecord.uid).set({
      email: email,
      assignedShops: assignedShops,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: context.auth.uid,
    });

    // 6. Return success
    return {
      success: true,
      uid: userRecord.uid,
      email: email,
      message: 'Admin created successfully'
    };

  } catch (error) {
    console.error('Error creating admin:', error);
    
    if (error.code === 'auth/email-already-exists') {
      throw new functions.https.HttpsError(
        'already-exists',
        'An account with this email already exists.'
      );
    }
    
    throw new functions.https.HttpsError(
      'internal',
      'Failed to create admin account.'
    );
  }
});
```

### Step 3: Deploy the Function

```bash
firebase deploy --only functions
```

### Step 4: Update Client Code

Replace the `handleCreateAdmin` function in `SuperAdminDashboard.jsx`:

```javascript
import { getFunctions, httpsCallable } from 'firebase/functions';

// At the top of the component
const functions = getFunctions();
const createAdminFunction = httpsCallable(functions, 'createAdmin');

const handleCreateAdmin = async () => {
  if (!newAdminEmail || !newAdminPassword) {
    alert('Please fill in all fields');
    return;
  }

  if (selectedShopsForAdmin.size === 0) {
    alert('Please assign at least one shop to the admin');
    return;
  }

  setCreatingAdmin(true);

  try {
    // Call the Cloud Function (won't log you out!)
    const result = await createAdminFunction({
      email: newAdminEmail,
      password: newAdminPassword,
      assignedShops: Array.from(selectedShopsForAdmin),
    });

    // Refresh admins list
    await fetchAdmins();

    // Reset form
    setNewAdminEmail('');
    setNewAdminPassword('');
    setSelectedShopsForAdmin(new Set());
    onAdminModalClose();

    alert(
      `Admin created successfully!\n\n` +
      `Email: ${newAdminEmail}\n` +
      `They can now log in with the provided credentials.`
    );
  } catch (error) {
    console.error('Error creating admin:', error);
    alert(error.message || 'Failed to create admin. Please try again.');
  } finally {
    setCreatingAdmin(false);
  }
};
```

### Step 5: Add Firebase Functions Package

```bash
npm install firebase-functions
```

---

## Benefits of Cloud Function Approach

✅ **No logout**: Super admin stays logged in  
✅ **More secure**: Admin SDK has full permissions  
✅ **Server-side validation**: Can't be bypassed by clients  
✅ **Better error handling**: Detailed error messages  
✅ **Email verification**: Can send verification emails  
✅ **Audit logging**: Track who created which admins  

---

## Quick Setup Guide

### 1. Initialize Firebase Functions

```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize functions in your project
firebase init functions
```

Choose:
- **Existing project**: posapplication-36ef9
- **Language**: JavaScript
- **ESLint**: Yes (recommended)
- **Install dependencies**: Yes

### 2. Add the Function

Copy the `createAdmin` function code above into `functions/index.js`

### 3. Deploy

```bash
firebase deploy --only functions
```

Wait for deployment to complete (~2 minutes)

### 4. Update Client

Add the import and update `handleCreateAdmin` as shown above

### 5. Test

Try creating an admin - you should stay logged in!

---

## Alternative: Email Link Creation

Another approach is to send an invitation email:

```javascript
exports.inviteAdmin = functions.https.onCall(async (data, context) => {
  // Verify super admin
  if (!context.auth?.token.superAdmin) {
    throw new functions.https.HttpsError('permission-denied', 'Not authorized');
  }

  const { email, assignedShops } = data;

  // Create a pending invitation
  await admin.firestore().collection('adminInvitations').add({
    email: email,
    assignedShops: assignedShops,
    createdBy: context.auth.uid,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    status: 'pending',
  });

  // Send invitation email with sign-up link
  // (requires Email extension or custom email service)
  
  return { success: true, message: 'Invitation sent' };
});
```

Then the invited admin can:
1. Click the invitation link
2. Create their own password
3. Get automatically assigned to shops

---

## For Now (Development)

The current implementation with the warning message works fine for development and testing. Just remember:

1. After creating an admin, you'll be logged out
2. Log back in as super admin
3. The new admin account is created successfully

---

## Summary

**Current (Client-side)**:
- ❌ Logs out super admin
- ✅ Simple to implement
- ✅ Works for development

**Recommended (Cloud Function)**:
- ✅ Super admin stays logged in
- ✅ More secure
- ✅ Production-ready
- ❌ Requires Cloud Functions setup

Choose the Cloud Function approach when deploying to production!

---

## Files to Update

1. `functions/index.js` - Add the createAdmin function
2. `src/pages/SuperAdminDashboard.jsx` - Update handleCreateAdmin
3. `package.json` - Add firebase-functions dependency

See the code examples above for complete implementation.
