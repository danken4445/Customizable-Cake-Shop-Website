# 🚀 Deployment Guide

## Option 1: Vercel (Recommended - Easiest)

### Prerequisites

- A GitHub account
- Your code pushed to GitHub

### Steps

1. **Push to GitHub**

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/cake-shop-website.git
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to https://vercel.com
   - Sign up/Login with GitHub
   - Click "Import Project"
   - Select your repository
   - Vercel will auto-detect Vite
   - Click "Deploy"
   - Done! Your site will be live at `your-project.vercel.app`

### Environment Variables (Optional)

If you move Firebase config to .env:

- In Vercel dashboard, go to Settings → Environment Variables
- Add each variable from your .env file

---

## Option 2: Netlify

### Steps

1. **Build the project**

   ```bash
   npm run build
   ```

2. **Deploy**
   - Go to https://netlify.com
   - Sign up/Login
   - Drag and drop the `dist` folder
   - Or connect your GitHub repo for automatic deployments

### Build Settings

- Build command: `npm run build`
- Publish directory: `dist`

---

## Option 3: Firebase Hosting

### Steps

1. **Install Firebase CLI**

   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**

   ```bash
   firebase login
   ```

3. **Initialize Firebase Hosting**

   ```bash
   firebase init hosting
   ```

   Select:

   - Use existing project → Select your cake shop project
   - Public directory: `dist`
   - Configure as SPA: `Yes`
   - Set up automatic builds: `No`

4. **Build your app**

   ```bash
   npm run build
   ```

5. **Deploy**
   ```bash
   firebase deploy --only hosting
   ```

Your site will be live at `your-project.web.app`

---

## Option 4: GitHub Pages

### Steps

1. **Install gh-pages**

   ```bash
   npm install -D gh-pages
   ```

2. **Update package.json**
   Add to scripts:

   ```json
   {
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     }
   }
   ```

3. **Update vite.config.js**
   Add base:

   ```javascript
   export default defineConfig({
     base: "/cake-shop-website/",
     plugins: [react()],
   });
   ```

4. **Deploy**
   ```bash
   npm run deploy
   ```

Your site will be at `https://yourusername.github.io/cake-shop-website/`

---

## Post-Deployment Checklist

### 1. Update Firebase Settings

- Go to Firebase Console → Authentication → Settings
- Add your production domain to authorized domains

### 2. Update Firestore Rules

Switch from test mode to production rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /cakeShops/{shopId} {
      allow read: if true;

      match /cakes/{cakeId} {
        allow read: if true;
      }

      match /options/{optionId} {
        allow read: if true;
      }

      match /orders/{orderId} {
        allow read: if request.auth != null;
        allow create: if true;
        allow update: if request.auth != null;
      }
    }
  }
}
```

### 3. Update Storage Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### 4. Add Custom Domain (Optional)

- In your hosting provider (Vercel/Netlify), go to domain settings
- Add your custom domain
- Update DNS records as instructed

### 5. Set Up HTTPS

- Most hosting providers (Vercel, Netlify, Firebase) provide free SSL
- HTTPS should be enabled automatically

---

## Performance Optimization

### 1. Image Optimization

- Use Firebase Storage for images
- Compress images before uploading (use TinyPNG, ImageOptim)
- Consider using CDN for images

### 2. Code Splitting

Already handled by Vite, but you can add:

```javascript
// Lazy load pages
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
```

### 3. Enable Caching

Add to `public/_headers` (for Netlify):

```
/assets/*
  Cache-Control: public, max-age=31536000, immutable
```

---

## Monitoring & Analytics

### Google Analytics (Optional)

1. Create a GA4 property
2. Add tracking code to `index.html`:

```html
<!-- Google tag (gtag.js) -->
<script
  async
  src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    dataLayer.push(arguments);
  }
  gtag("js", new Date());
  gtag("config", "G-XXXXXXXXXX");
</script>
```

### Firebase Analytics

Already integrated if you enabled it during Firebase setup!

---

## Troubleshooting Deployment

### Issue: Routes not working (404 on refresh)

**Solution**: Make sure your hosting is configured for SPA

- Vercel: Auto-configured
- Netlify: Add `public/_redirects`:
  ```
  /*    /index.html   200
  ```
- Firebase: Set `rewrites` in firebase.json

### Issue: Environment variables not working

**Solution**:

- Make sure they're prefixed with `VITE_`
- Add them to your hosting provider's environment variables
- Rebuild and redeploy

### Issue: Firebase errors in production

**Solution**:

- Check Firebase authorized domains
- Verify API keys are correct
- Check browser console for specific errors

---

## Cost Estimates

### Free Tier (Good for MVP)

- **Hosting**: Free on Vercel/Netlify/Firebase
- **Firebase Firestore**: 50K reads/day free
- **Firebase Storage**: 5GB free
- **Firebase Authentication**: Unlimited free

### Paid Tier (If you grow)

- **Firebase**: Pay as you go (very affordable)
- **Hosting**: Vercel/Netlify Pro ($20-40/month) for advanced features

---

## Next Steps After Deployment

1. ✅ Share your website URL with friends
2. 📱 Test on mobile devices
3. 🎨 Customize branding and colors
4. 📸 Replace placeholder images with real photos
5. 🛍️ Start accepting orders!
6. 💳 Add payment integration (future enhancement)

**Congratulations on deploying your cake shop! 🎉🎂**
