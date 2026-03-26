# Google Sign-In Architecture & Flow Diagram

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INTERFACE                            │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              Login Page (login.page.html)                   │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │  [Email Input]  [Password Input]  [Login Button]     │  │ │
│  │  │                                                        │  │ │
│  │  │  ┌──────────────────────────────────────────────┐    │  │ │
│  │  │  │  [🔵 Sign in with Google]                    │    │  │ │
│  │  │  │   (click) → signInWithGoogle()               │    │  │ │
│  │  │  └──────────────────────────────────────────────┘    │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    COMPONENT LAYER                               │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              LoginPage (login.page.ts)                      │ │
│  │                                                              │ │
│  │  async signInWithGoogle() {                                 │ │
│  │    this.loaderService.show();                               │ │
│  │    const response = await                                   │ │
│  │      this.firebaseService.signInWithGoogle();               │ │
│  │    // Handle response...                                    │ │
│  │  }                                                           │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                     SERVICE LAYER                                │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │           FirebaseService (firebase.service.ts)             │ │
│  │                                                              │ │
│  │  signInWithGoogle() {                                       │ │
│  │    // Platform detection                                    │ │
│  │    if (isNative) {                                          │ │
│  │      return signInWithGoogleNative();                       │ │
│  │    } else {                                                 │ │
│  │      return signInWithGoogleWeb();                          │ │
│  │    }                                                         │ │
│  │  }                                                           │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    ┌─────────┴─────────┐
                    │                   │
                    ↓                   ↓
┌──────────────────────────┐  ┌──────────────────────────┐
│   NATIVE (Android/iOS)   │  │      WEB (Browser)       │
│                          │  │                          │
│  SocialLogin.login({     │  │  signInWithPopup(        │
│    provider: 'google',   │  │    auth,                 │
│    options: {...}        │  │    GoogleAuthProvider    │
│  })                      │  │  )                       │
│                          │  │                          │
│  ↓                       │  │  ↓                       │
│  Native Google Picker    │  │  Google Popup Window     │
│  ↓                       │  │  ↓                       │
│  Get idToken             │  │  Get user & token        │
└──────────────────────────┘  └──────────────────────────┘
            │                             │
            └──────────┬──────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────────┐
│                  FIREBASE AUTHENTICATION                         │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  signInWithCredential(auth, GoogleAuthProvider.credential)  │ │
│  │                                                              │ │
│  │  Returns: Firebase User Object                              │ │
│  │  - uid                                                       │ │
│  │  - email                                                     │ │
│  │  - displayName                                               │ │
│  │  - photoURL                                                  │ │
│  │  - idToken                                                   │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    DATA PROCESSING                               │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Extract & Format User Data:                                │ │
│  │  {                                                           │ │
│  │    email, firstName, lastName, fullName,                    │ │
│  │    photoUrl, providerId, idToken, fcmToken, ...             │ │
│  │  }                                                           │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND API CALL                              │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  POST /api/v1/auth/google-login                             │ │
│  │                                                              │ │
│  │  Request Body: { email, idToken, ... }                      │ │
│  │                                                              │ │
│  │  Backend validates Firebase token                           │ │
│  │  Creates/updates user account                               │ │
│  │  Generates JWT access token                                 │ │
│  │                                                              │ │
│  │  Response: { code: 200, access_token: "..." }               │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    LOCAL STORAGE                                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  localStorage.setItem('token', access_token)                │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    NAVIGATION                                    │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  router.navigate(['/dashboard'])                            │ │
│  │                                                              │ │
│  │  User is now logged in! ✅                                  │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Detailed Flow Sequence

### **Step 1: User Interaction**
```
User clicks "Sign in with Google" button
    ↓
login.page.html triggers (click)="signInWithGoogle()"
    ↓
login.page.ts: signInWithGoogle() method is called
```

### **Step 2: Service Call**
```
LoginPage calls FirebaseService.signInWithGoogle()
    ↓
FirebaseService detects platform (native vs web)
    ↓
Calls appropriate method:
  - signInWithGoogleNative() for mobile
  - signInWithGoogleWeb() for browser
```

### **Step 3: Platform-Specific Authentication**

#### **Native (Android/iOS):**
```
1. Initialize SocialLogin plugin
2. Call SocialLogin.login({ provider: 'google' })
3. Native Google account picker appears
4. User selects account
5. Get idToken from response
6. Sign in to Firebase with credential
```

#### **Web (Browser):**
```
1. Create GoogleAuthProvider
2. Call signInWithPopup(auth, provider)
3. Popup window opens with Google sign-in
4. User signs in
5. Get user data and token from response
6. Firebase authentication complete
```

### **Step 4: Data Processing**
```
Extract user information:
  - email
  - firstName, lastName
  - fullName, displayName
  - photoUrl
  - providerId (google)
  - idToken (Firebase)
  - fcmToken (device)
```

### **Step 5: Backend Integration**
```
Send POST request to:
  https://globalrubberhub.com/api/v1/auth/google-login

Backend:
  1. Validates Firebase idToken
  2. Checks if user exists
  3. Creates new user OR updates existing user
  4. Generates JWT access token
  5. Returns response with token
```

### **Step 6: Local Storage & Navigation**
```
Store access_token in localStorage
    ↓
Call authService.handleSuccessfulLogin()
    ↓
Show success toast
    ↓
Navigate to /dashboard
    ↓
User is logged in! ✅
```

---

## 🔐 Security Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                               │
└─────────────────────────────────────────────────────────────────┘

1. Google OAuth 2.0
   ├─ User authenticates with Google
   ├─ Google validates credentials
   └─ Returns OAuth tokens

2. Firebase Authentication
   ├─ Validates Google idToken
   ├─ Creates Firebase user session
   └─ Returns Firebase idToken

3. Backend Validation
   ├─ Receives Firebase idToken
   ├─ Validates token with Firebase Admin SDK
   ├─ Verifies token signature
   ├─ Checks token expiration
   └─ Extracts user information

4. JWT Token Generation
   ├─ Backend generates JWT access token
   ├─ Signs with secret key
   ├─ Sets expiration time
   └─ Returns to client

5. Client Storage
   ├─ Store JWT in localStorage
   ├─ Include in Authorization header for API calls
   └─ Refresh when expired
```

---

## 📊 Data Flow Diagram

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Client  │────▶│  Google  │────▶│ Firebase │────▶│ Backend  │
│   App    │     │  OAuth   │     │   Auth   │     │   API    │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
     │                │                 │                │
     │ 1. Request     │                 │                │
     │ Sign-In        │                 │                │
     │───────────────▶│                 │                │
     │                │                 │                │
     │                │ 2. User         │                │
     │                │ Authenticates   │                │
     │                │                 │                │
     │                │ 3. OAuth Token  │                │
     │◀───────────────│                 │                │
     │                │                 │                │
     │ 4. Send OAuth  │                 │                │
     │ Token          │                 │                │
     │────────────────────────────────▶│                │
     │                │                 │                │
     │                │                 │ 5. Validate    │
     │                │                 │ & Create User  │
     │                │                 │                │
     │                │                 │ 6. Firebase    │
     │                │                 │ idToken        │
     │◀────────────────────────────────│                │
     │                │                 │                │
     │ 7. Send Firebase idToken         │                │
     │──────────────────────────────────────────────────▶│
     │                │                 │                │
     │                │                 │                │ 8. Validate
     │                │                 │                │ idToken
     │                │                 │                │
     │                │                 │                │ 9. Create/
     │                │                 │                │ Update User
     │                │                 │                │
     │                │                 │ 10. JWT Token  │
     │◀──────────────────────────────────────────────────│
     │                │                 │                │
     │ 11. Store      │                 │                │
     │ Token          │                 │                │
     │                │                 │                │
     │ 12. Navigate   │                 │                │
     │ to Dashboard   │                 │                │
     │                │                 │                │
```

---

## 🌐 Platform Detection Logic

```
┌─────────────────────────────────────────────────────────────────┐
│                   PLATFORM DETECTION                             │
└─────────────────────────────────────────────────────────────────┘

Check platform.is('capacitor') OR platform.is('cordova')
                    │
        ┌───────────┴───────────┐
        │                       │
       YES                     NO
        │                       │
        ↓                       ↓
  ┌──────────┐          ┌──────────┐
  │  NATIVE  │          │   WEB    │
  └──────────┘          └──────────┘
        │                       │
        ↓                       ↓
  Use SocialLogin         Use Firebase
  Plugin                  Web SDK
        │                       │
        ↓                       ↓
  Native Account          Popup Window
  Picker                  Authentication
```

---

## 🔧 Configuration Dependencies

```
┌─────────────────────────────────────────────────────────────────┐
│                   CONFIGURATION FILES                            │
└─────────────────────────────────────────────────────────────────┘

google-services.json
    ├─ Project configuration
    ├─ OAuth client IDs
    ├─ API keys
    └─ SHA-1 certificate

environment.ts / environment.prod.ts
    ├─ webClientId
    ├─ androidClientId
    ├─ Firebase config
    └─ VAPID key

firebase.config.ts
    ├─ Initialize Firebase app
    ├─ Initialize Auth
    └─ Initialize Messaging

package.json
    ├─ @capgo/capacitor-social-login
    ├─ firebase
    └─ @angular/fire
```

---

## 🎯 Error Handling Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                   ERROR HANDLING                                 │
└─────────────────────────────────────────────────────────────────┘

Try Google Sign-In
    │
    ├─ Success ──────────────────────────────────────┐
    │                                                 │
    └─ Error                                          │
        │                                             │
        ├─ Error Code 10 (DEVELOPER_ERROR)           │
        │   └─ Show SHA-1 configuration error        │
        │                                             │
        ├─ Plugin not available                      │
        │   └─ Show plugin installation error        │
        │                                             │
        ├─ Network error                             │
        │   └─ Show network error message            │
        │                                             │
        ├─ Backend error                             │
        │   └─ Show backend error message            │
        │                                             │
        └─ Other errors                              │
            └─ Show generic error message            │
                                                      │
                                                      ↓
                                            Continue to Dashboard
```

---

## 📱 User Experience Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER EXPERIENCE                               │
└─────────────────────────────────────────────────────────────────┘

1. User sees login page
   └─ Email/Password fields
   └─ "Sign in with Google" button

2. User clicks "Sign in with Google"
   └─ Loading indicator appears

3. Authentication UI appears
   ├─ Native: Account picker (Android/iOS)
   └─ Web: Popup window

4. User selects account / signs in
   └─ UI closes automatically

5. Loading indicator continues
   └─ Backend processing

6. Success toast appears
   └─ "Successfully signed in with Google!"

7. Navigate to dashboard
   └─ User is logged in ✅

Error Path:
   └─ Error toast appears
   └─ User stays on login page
   └─ Can retry sign-in
```

---

## 🔄 Token Refresh Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    TOKEN LIFECYCLE                               │
└─────────────────────────────────────────────────────────────────┘

Initial Login
    ↓
JWT Token Generated (expires in X hours)
    ↓
Store in localStorage
    ↓
Use for API calls (Authorization: Bearer <token>)
    ↓
Token Expires
    ↓
API returns 401 Unauthorized
    ↓
Refresh token OR re-authenticate
    ↓
Get new JWT token
    ↓
Update localStorage
    ↓
Retry API call
```

---

This architecture ensures:
- ✅ Secure authentication
- ✅ Platform-specific optimization
- ✅ Proper error handling
- ✅ Seamless user experience
- ✅ Backend integration
- ✅ Token management
