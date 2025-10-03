# Service Account Key Setup

⚠️ **DO NOT COMMIT THIS FILE TO GIT!**

This folder needs a `serviceAccountKey.json` file to run the super admin setup script.

## How to Get Your Service Account Key

1. **Go to Firebase Console**: https://console.firebase.google.com
2. **Select your project**: posapplication-36ef9
3. **Navigate to**: Project Settings (⚙️ icon) → Service Accounts tab
4. **Click**: "Generate New Private Key" button
5. **Save the file** as `serviceAccountKey.json` in this `scripts/` folder

## Security Warning

🔒 **This file contains sensitive credentials!**

- Never commit it to Git
- Never share it publicly
- Keep it secure on your local machine
- It's already added to `.gitignore`

## File Structure

After downloading, your file should look like this:

```json
{
  "type": "service_account",
  "project_id": "posapplication-36ef9",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@posapplication-36ef9.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```

## After Setup

Once you have the file in place, you can run:

```bash
node scripts/set-super-admin.js
```

## Need Help?

See `docs/SUPER_ADMIN_SETUP.md` for complete instructions.
