# Step-by-Step Guide: Linking CampusConnect to Firebase

Follow these 5 simple steps to get your Firebase Google Sign-In working in less than 3 minutes.

---

### Step 1: Open Firebase Console
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Sign in with your Google account.
3. Click **"Add project"** (or **"Create a project"**).
4. Enter a project name, e.g.: `sreyas-campusconnect`.
5. You can disable Google Analytics for this project (optional), then click **"Create project"**.

---

### Step 2: Enable Google Authentication
1. Once the project dashboard loads, click on **Build** in the left sidebar, then click **Authentication**.
2. Click the **"Get started"** button.
3. In the **Sign-in method** tab, click on **Google** under *Additional providers*.
4. Toggle the **Enable** switch to **ON**.
5. Select your email under **Project support email**.
6. Click **Save**.

---

### Step 3: Verify Authorized Domains (for Local Development)
1. In the Authentication section, click the **Settings** tab at the top.
2. Click **Authorized domains** in the submenu.
3. Ensure **`localhost`** is present in the list (Firebase adds `localhost` automatically by default).

---

### Step 4: Register Web App to Get Your Config Keys
1. In the top-left sidebar, click the **Project Overview** (gear icon / Home).
2. Under "Get started by adding Firebase to your app", click the **Web icon (`</>`)**.
3. Enter an App nickname, e.g.: `CampusConnect Web`.
4. (You can leave *Firebase Hosting* unchecked).
5. Click **"Register app"**.
6. Firebase will now display your `firebaseConfig` object:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
     authDomain: "sreyas-campusconnect.firebaseapp.com",
     projectId: "sreyas-campusconnect",
     storageBucket: "sreyas-campusconnect.appspot.com",
     messagingSenderId: "123456789012",
     appId: "1:123456789012:web:abcdef1234567890"
   };
   ```

---

### Step 5: Paste Your Keys into `client/.env`
Open the file [`client/.env`](./.env) located at:
`C:\Users\akshi\OneDrive\Desktop\web tech project(CAMPUS LOST AND FOUND)\client\.env`

Replace the empty values with your keys:

```env
VITE_API_BASE_URL=/api

VITE_FIREBASE_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_FIREBASE_AUTH_DOMAIN=sreyas-campusconnect.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=sreyas-campusconnect
VITE_FIREBASE_STORAGE_BUCKET=sreyas-campusconnect.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
```

Save the file, then restart the development server:
```powershell
npm run dev
```

---

### 🎉 You're Ready!
Go to [http://localhost:5173/login](http://localhost:5173/login) and click **"Sign in with Sreyas Google Account"**.
- If a user signs in with `<rollnumber>@sreyas.ac.in`, they will log in immediately.
- If a user signs in with any unauthorized Gmail or external email, Firebase will reject the login and display the error notice!
