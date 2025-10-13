import { Injectable } from '@angular/core';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { 
  getToken, 
  onMessage, 
  getMessaging,
  isSupported 
} from 'firebase/messaging';
import { auth, messaging } from '../../firebase.config';
import { Platform } from '@ionic/angular';
import { CommonService } from './common-service';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

// Declare Cordova plugin types
declare var window: any;

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private currentUser: User | null = null;
  private fcmToken: string | null = null;

  constructor(
    private platform: Platform,
    private commonService: CommonService,
    private authService: AuthService,
    private router: Router
  ) {
    this.initializeAuth();
    this.initializeMessaging();
  }

  /**
   * Initialize Firebase Authentication
   */
  private initializeAuth() {
    onAuthStateChanged(auth, (user) => {
      this.currentUser = user;
      if (user) {
        console.log('User signed in:', user);
        // Send FCM token to backend if available
        if (this.fcmToken) {
          this.sendFCMTokenToBackend();
        }
      } else {
        console.log('User signed out');
      }
    });
  }

  /**
   * Initialize Firebase Cloud Messaging
   */
  private async initializeMessaging() {
    console.log('=== FIREBASE MESSAGING INITIALIZATION ===');
    console.log('Platform check:', {
      isCapacitor: this.platform.is('capacitor'),
      isCordova: this.platform.is('cordova'),
      isMobile: this.platform.is('mobile'),
      isDesktop: this.platform.is('desktop'),
      platforms: this.platform.platforms()
    });
    
    if (this.platform.is('capacitor')) {
      console.log('Initializing Capacitor push notifications...');
      await this.initializeCapacitorPushNotifications();
    } else {
      console.log('Initializing web push notifications...');
      await this.initializeWebPushNotifications();
    }
    
    console.log('=== END FIREBASE MESSAGING INITIALIZATION ===');
  }

  /**
   * Initialize push notifications for web
   */
  private async initializeWebPushNotifications() {
    console.log('Initializing web push notifications...');
    
    if (!isSupported()) {
      console.log('Firebase Messaging is not supported in this browser');
      return;
    }

    try {
      // Register service worker first
      console.log('Registering service worker...');
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
          console.log('Service Worker registered successfully:', registration);
          
          // Wait for service worker to be ready
          await navigator.serviceWorker.ready;
          console.log('Service Worker is ready');
        } catch (swError) {
          console.error('Service Worker registration failed:', swError);
          // Continue without service worker
        }
      } else {
        console.warn('Service Worker not supported in this browser');
      }

      console.log('Requesting notification permission...');
      // Request permission for notifications
      const permission = await Notification.requestPermission();
      console.log('Notification permission result:', permission);
      
      if (permission === 'granted') {
        console.log('Permission granted, getting FCM token...');
        console.log('Using VAPID key:', environment.firebase.vapidKey);
        
        // Get FCM token with retry mechanism
        let retries = 3;
        while (retries > 0 && !this.fcmToken) {
          try {
            console.log(`Attempting to get FCM token (${4 - retries}/3)...`);
            this.fcmToken = await getToken(messaging, {
              vapidKey: environment.firebase.vapidKey
            });
            
            if (this.fcmToken) {
              console.log('FCM Token generated successfully:', this.fcmToken);
              this.sendFCMTokenToBackend();
              break;
            } else {
              console.warn('FCM Token is null, retrying...');
              retries--;
              if (retries > 0) {
                await new Promise(resolve => setTimeout(resolve, 1000));
              }
            }
          } catch (tokenError) {
            console.error('Error getting FCM token:', tokenError);
            retries--;
            if (retries > 0) {
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }
        }

        if (!this.fcmToken) {
          console.error('Failed to generate FCM token after 3 attempts');
        }

        // Listen for foreground messages
        onMessage(messaging, (payload) => {
          console.log('Message received in foreground:', payload);
          this.handleForegroundMessage(payload);
        });
      } else {
        console.log('Notification permission denied');
      }
    } catch (error) {
      console.error('Error initializing web push notifications:', error);
      console.error('Error details:', error);
    }
  }

  /**
   * Initialize push notifications for Capacitor
   */
  private async initializeCapacitorPushNotifications() {
    try {
      const { PushNotifications } = await import('@capacitor/push-notifications');
      
      // Request permission
      const permStatus = await PushNotifications.requestPermissions();
      if (permStatus.receive === 'granted') {
        // Register with Apple / Google to receive push via APNS/FCM
        await PushNotifications.register();

        // Listen for registration
        PushNotifications.addListener('registration', (token) => {
          console.log('Registration token: ', token.value);
          this.fcmToken = token.value;
          this.sendFCMTokenToBackend();
        });

        // Listen for registration errors
        PushNotifications.addListener('registrationError', (err) => {
          console.error('Registration error: ', err.error);
        });

        // Listen for push notifications
        PushNotifications.addListener('pushNotificationReceived', (notification) => {
          console.log('Push notification received: ', notification);
          this.handleForegroundMessage(notification);
        });

        // Listen for push notification actions
        PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
          console.log('Push notification action performed', notification.actionId, notification.inputValue);
          this.handleNotificationAction(notification);
        });
      }
    } catch (error) {
      console.error('Error initializing Capacitor push notifications:', error);
    }
  }

  /**
   * Google Sign-In
   */
  async signInWithGoogle(): Promise<any> {
    try {
      console.log('=== GOOGLE SIGN-IN DEBUG START ===');
      console.log('Platform check:', {
        isCapacitor: this.platform.is('capacitor'),
        isCordova: this.platform.is('cordova'),
        isMobile: this.platform.is('mobile'),
        isDesktop: this.platform.is('desktop'),
        platform: this.platform.platforms()
      });

      console.log('Environment webClientId:', environment.firebase.webClientId);
      console.log('Environment androidClientId:', environment.firebase.androidClientId);
      console.log('Window plugins available:', !!window.plugins);
      console.log('Google Plus plugin available:', !!(window.plugins && window.plugins.googleplus));

      // Check if we're on a mobile platform (Cordova/Capacitor)
      if (this.platform.is('capacitor') || this.platform.is('cordova') || this.platform.is('mobile')) {
        console.log('Using native Google Sign-In for mobile platform');
        return await this.signInWithGoogleNative();
      } else {
        console.log('Using Firebase web SDK for browser platform');
        // Use Firebase web SDK for browser
        return await this.signInWithGoogleWeb();
      }
    } catch (error: any) {
      console.error('=== GOOGLE SIGN-IN ERROR ===');
      console.error('Error type:', typeof error);
      console.error('Error message:', error?.message);
      console.error('Error code:', error?.code);
      console.error('Error details:', error);
      console.error('Full error object:', JSON.stringify(error, null, 2));
      console.error('=== END ERROR DEBUG ===');
      throw error;
    }
  }

  /**
   * Google Sign-In for native mobile platforms (Android/iOS)
   */
  private async signInWithGoogleNative(): Promise<any> {
    return new Promise((resolve, reject) => {
      console.log('Starting Google Sign-In Native...');
      console.log('Environment webClientId:', environment.firebase.webClientId);
      console.log('Environment androidClientId:', environment.firebase.androidClientId);
      
      if (!window.plugins || !window.plugins.googleplus) {
        console.error('Google Plus plugin not available');
        reject(new Error('Google Plus plugin not available. Make sure the cordova-plugin-googleplus is properly installed.'));
        return;
      }

      console.log('Google Plus plugin is available, checking device availability...');

      // Check if Google Plus is available on the device
      window.plugins.googleplus.isAvailable((available: boolean) => {
        console.log('Google Plus availability:', available);
        
        if (!available) {
          console.error('Google Sign-In is not available on this device');
          reject(new Error('Google Sign-In is not available on this device.'));
          return;
        }

        const options = {
          // You can add scopes here if needed
          scopes: 'profile email',
          webClientId: environment.firebase.webClientId,
          offline: true
        };

        console.log('Attempting Google Sign-In with options:', options);

        window.plugins.googleplus.login(options, (userData: any) => {
          console.log('Google Sign-In Success:', userData);
          
          // Validate userData before processing
          if (!userData || !userData.userId) {
            console.error('Invalid user data received:', userData);
            reject(new Error('Invalid user data received from Google Sign-In'));
            return;
          }
          
          // Send user data to your backend
          const userInfo = {
            uid: userData.userId || '',
            email: userData.email || '',
            displayName: userData.displayName || '',
            photoURL: userData.imageUrl || '',
            fcmToken: this.fcmToken,
            idToken: userData.idToken || '',
            serverAuthCode: userData.serverAuthCode || ''
          };

          console.log('Processed user info:', userInfo);

          // Call your backend API to create/update user
          this.sendGoogleUserToBackend(userInfo).then(resolve).catch(reject);
        }, (error: any) => {
          console.error('Google Sign-In Error Details:', {
            error: error,
            errorCode: error?.errorCode,
            errorMessage: error?.errorMessage,
            errorDetails: error?.errorDetails
          });
          reject(error);
        });
      });
    });
  }

  /**
   * Google Sign-In for web browsers
   */
  private async signInWithGoogleWeb(): Promise<any> {
    const provider = new GoogleAuthProvider();
    const result:any = await signInWithPopup(auth, provider);
    const user:any = result.user;
    const tokenResponse:any = result._tokenResponse;    
    // Send user data to your backend
    const userData = {
      // uid: user.uid,
      // email: user.email,
      // displayName: user.displayName,
      // photoURL: user.photoURL,
      // fcmToken: this.fcmToken



    email : tokenResponse.email,
    emailVerified: tokenResponse.emailVerified,
    firstName: tokenResponse.firstName,
    lastName : tokenResponse.lastName,
    fullName : tokenResponse.fullName,
    displayName : tokenResponse.displayName, 
    photoUrl: tokenResponse.photoURL, 
    providerId: tokenResponse.providerId=='google.com'?'google':tokenResponse.providerId,
    federatedId:tokenResponse.federatedId,
    localId: tokenResponse.localId,
    idToken: tokenResponse.idToken,
    oauthAccessToken:tokenResponse.oauthAccessToken,
    oauthExpireIn: tokenResponse.oauthExpireIn,
    refreshToken: tokenResponse.refreshToken
    };

    // Call your backend API to create/update user
    return await this.sendGoogleUserToBackend(userData);
  }

  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    try {
      await signOut(auth);
      localStorage.clear();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  /**
   * Send Google user data to backend
   */
  private async sendGoogleUserToBackend(userData: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.commonService.login('auth/google-login', userData).subscribe(
        (response: any) => {
          if (response.code === 200 || response.code === 201) {
            localStorage.setItem('token', response.access_token);
            this.authService.handleSuccessfulLogin();
            resolve(response);
          } else {
            reject(new Error(response.message || 'Authentication failed'));
          }
        },
        (error) => {
          console.error('Backend authentication error:', error);
          reject(error);
        }
      );
    });
  }

  /**
   * Send FCM token to backend
   */
  private sendFCMTokenToBackend(): void {
    if (this.fcmToken && this.currentUser) {
      const tokenData = {
        fcmToken: this.fcmToken,
        userId: this.currentUser.uid
      };

      this.commonService.post('user/fcm-token', tokenData).subscribe(
        (response: any) => {
          console.log('FCM token sent to backend:', response);
        },
        (error) => {
          console.error('Error sending FCM token to backend:', error);
        }
      );
    }
  }

  /**
   * Handle foreground messages
   */
  private handleForegroundMessage(payload: any): void {
    // Show notification or handle the message
    console.log('Foreground message:', payload);
    
    // You can show a toast, modal, or update UI here
    if (payload.notification) {
      // Handle notification data
      console.log('Notification title:', payload.notification.title);
      console.log('Notification body:', payload.notification.body);
    }
  }

  /**
   * Handle notification actions
   */
  private handleNotificationAction(notification: any): void {
    // Handle notification tap/action
    console.log('Notification action performed:', notification);
    
    // Navigate to specific page based on notification data
    if (notification.notification.data && notification.notification.data.route) {
      this.router.navigate([notification.notification.data.route]);
    }
  }

  /**
   * Get FCM token
   */
  getFCMToken(): string | null {
    return this.fcmToken;
  }

  /**
   * Manually trigger FCM token generation
   */
  async generateFCMToken(): Promise<string | null> {
    try {
      console.log('=== MANUAL FCM TOKEN GENERATION ===');
      console.log('Current FCM token:', this.fcmToken);
      console.log('Platform:', this.platform.platforms());
      
      if (this.platform.is('capacitor') || this.platform.is('cordova')) {
        console.log('Using Capacitor push notifications for FCM token');
        await this.initializeCapacitorPushNotifications();
      } else {
        console.log('Using web push notifications for FCM token');
        await this.initializeWebPushNotifications();
      }
      
      console.log('FCM token after generation:', this.fcmToken);
      console.log('=== END MANUAL FCM TOKEN GENERATION ===');
      
      return this.fcmToken;
    } catch (error) {
      console.error('Error generating FCM token:', error);
      console.error('Error details:', error);
      return null;
    }
  }

  /**
   * Force FCM token generation with retry mechanism
   */
  async forceGenerateFCMToken(): Promise<string | null> {
    console.log('=== FORCE FCM TOKEN GENERATION ===');
    
    try {
      // Check if messaging is supported
      if (!isSupported()) {
        console.error('Firebase Messaging is not supported in this browser');
        return null;
      }

      // Register service worker if not already registered
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
          console.log('Service Worker registered for FCM:', registration);
          await navigator.serviceWorker.ready;
        } catch (swError) {
          console.warn('Service Worker registration failed, continuing without it:', swError);
        }
      }

      // Request permission
      console.log('Requesting notification permission...');
      const permission = await Notification.requestPermission();
      console.log('Permission result:', permission);

      if (permission !== 'granted') {
        console.warn('Notification permission not granted');
        return null;
      }

      // Get token with retry
      let retries = 3;
      while (retries > 0) {
        try {
          console.log(`Attempting to get FCM token (${4 - retries}/3)...`);
          console.log('Using VAPID key:', environment.firebase.vapidKey);
          
          const token = await getToken(messaging, {
            vapidKey: environment.firebase.vapidKey
          });
          
          if (token) {
            console.log('FCM token generated successfully:', token);
            this.fcmToken = token;
            return token;
          } else {
            console.warn('FCM token is null, retrying...');
            retries--;
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
          }
        } catch (tokenError) {
          console.error('Error getting FCM token:', tokenError);
          retries--;
          if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
          }
        }
      }
      
      console.error('Failed to generate FCM token after 3 attempts');
      return null;
    } catch (error) {
      console.error('Error in force FCM token generation:', error);
      return null;
    }
  }

  /**
   * Generate FCM token without service worker (fallback method)
   */
  async generateFCMTokenWithoutSW(): Promise<string | null> {
    console.log('=== FCM TOKEN GENERATION WITHOUT SERVICE WORKER ===');
    
    try {
      // Check if messaging is supported
      if (!isSupported()) {
        console.error('Firebase Messaging is not supported in this browser');
        return null;
      }

      // Request permission
      console.log('Requesting notification permission...');
      const permission = await Notification.requestPermission();
      console.log('Permission result:', permission);

      if (permission !== 'granted') {
        console.warn('Notification permission not granted');
        return null;
      }

      // Try to get token without service worker
      try {
        console.log('Attempting to get FCM token without service worker...');
        console.log('Using VAPID key:', environment.firebase.vapidKey);
        
        const token = await getToken(messaging, {
          vapidKey: environment.firebase.vapidKey
        });
        
        if (token) {
          console.log('FCM token generated successfully (without SW):', token);
          this.fcmToken = token;
          return token;
        } else {
          console.warn('FCM token is null');
          return null;
        }
      } catch (tokenError) {
        console.error('Error getting FCM token without service worker:', tokenError);
        return null;
      }
    } catch (error) {
      console.error('Error in FCM token generation without service worker:', error);
      return null;
    }
  }
}
