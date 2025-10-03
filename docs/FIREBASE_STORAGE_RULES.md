# Firebase Storage Rules

To fix the storage permission error, update your Firebase Storage rules:

## Option 1: Via Firebase Console (Recommended)

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: **posapplication-36ef9**
3. Click **Storage** in the left menu
4. Click the **Rules** tab
5. Replace the rules with the code below
6. Click **Publish**

## Storage Rules Code

```javascript
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    // Allow public read access to all files
    // Allow authenticated users to write to shops folder
    match /shops/{shopId}/{allPaths=**} {
      allow read: if true;  // Anyone can read/view images
      allow write: if true; // Allow uploads during onboarding (temp - see note below)
    }
    
    // Default: deny all other access
    match /{allPaths=**} {
      allow read: if true;  // Allow reading other files
      allow write: if request.auth != null; // Only authenticated users can write
    }
  }
}
```

## Production Rules (More Secure)

For production, you should restrict write access to authenticated users only:

```javascript
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    // Shop files
    match /shops/{shopId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null; // Only authenticated users can upload
    }
    
    // Default
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## Quick Fix (Development Only)

If you just want to test quickly during development:

```javascript
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true; // ⚠️ WARNING: Open to everyone!
    }
  }
}
```

**⚠️ WARNING**: This allows anyone to upload files to your storage. Only use this for development/testing!

## Steps to Apply

### Via Firebase Console:
1. Firebase Console → Storage → Rules
2. Paste the rules code
3. Click "Publish"

### Via Firebase CLI:
1. Create file `storage.rules` in your project root
2. Paste the rules code
3. Run: `firebase deploy --only storage`

## Why the Error Occurred

The default Firebase Storage rules look like this:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

This requires authentication for all read/write operations. Since the onboarding page doesn't require users to log in, uploads fail.

## Recommended Approach

1. **For Development**: Use the first rules (allow write: if true)
2. **For Production**: 
   - Option A: Require authentication before onboarding
   - Option B: Use Firebase Functions to handle uploads server-side
   - Option C: Use signed URLs with time limits

## Testing After Update

1. Update the rules in Firebase Console
2. Wait 30 seconds for changes to propagate
3. Try creating a shop with image upload again
4. Check browser console - should show no 403 errors

## Alternative: Skip Image Upload (Quick Test)

If you want to test without images temporarily, just don't select any files in the onboarding form. The shop will still be created without logo/cover images.

## Need Help?

- [Firebase Storage Security Rules Documentation](https://firebase.google.com/docs/storage/security)
- [Storage Rules Reference](https://firebase.google.com/docs/storage/security/rules-conditions)
