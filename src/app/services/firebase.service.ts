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
    if (this.platform.is('capacitor')) {
      // For mobile platforms, use Capacitor Push Notifications
      await this.initializeCapacitorPushNotifications();
    } else {
      // For web platforms, use Firebase Web SDK
      await this.initializeWebPushNotifications();
    }
  }

  /**
   * Initialize push notifications for web
   */
  private async initializeWebPushNotifications() {
    if (!isSupported()) {
      console.log('Firebase Messaging is not supported in this browser');
      return;
    }

    try {
      // Request permission for notifications
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        // Get FCM token
        this.fcmToken = await getToken(messaging, {
          vapidKey: 'your-vapid-key' // Replace with your VAPID key
        });
        
        if (this.fcmToken) {
          console.log('FCM Token:', this.fcmToken);
          this.sendFCMTokenToBackend();
        }

        // Listen for foreground messages
        onMessage(messaging, (payload) => {
          console.log('Message received in foreground:', payload);
          this.handleForegroundMessage(payload);
        });
      }
    } catch (error) {
      console.error('Error initializing web push notifications:', error);
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
      console.log('Platform check:', {
        isCapacitor: this.platform.is('capacitor'),
        isCordova: this.platform.is('cordova'),
        isMobile: this.platform.is('mobile'),
        isDesktop: this.platform.is('desktop')
      });

      // Check if we're on a mobile platform (Cordova/Capacitor)
      if (this.platform.is('capacitor') || this.platform.is('cordova')) {
        console.log('Using native Google Sign-In for mobile platform');
        return await this.signInWithGoogleNative();
      } else {
        console.log('Using Firebase web SDK for browser platform');
        // Use Firebase web SDK for browser
        return await this.signInWithGoogleWeb();
      }
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      throw error;
    }
  }

  /**
   * Google Sign-In for native mobile platforms (Android/iOS)
   */
  private async signInWithGoogleNative(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!window.plugins || !window.plugins.googleplus) {
        reject(new Error('Google Plus plugin not available. Make sure the cordova-plugin-googleplus is properly installed.'));
        return;
      }

      // Check if Google Plus is available on the device
      window.plugins.googleplus.isAvailable((available: boolean) => {
        if (!available) {
          reject(new Error('Google Sign-In is not available on this device.'));
          return;
        }

        const options = {
          // You can add scopes here if needed
          scopes: 'profile email',
          webClientId: environment.firebase.webClientId,
          offline: true
        };

        window.plugins.googleplus.login(options, (userData: any) => {
          console.log('Google Sign-In Success:', userData);
          
          // Send user data to your backend
          const userInfo = {
            uid: userData.userId,
            email: userData.email,
            displayName: userData.displayName,
            photoURL: userData.imageUrl,
            fcmToken: this.fcmToken,
            idToken: userData.idToken,
            serverAuthCode: userData.serverAuthCode
          };

          // Call your backend API to create/update user
          this.sendGoogleUserToBackend(userInfo).then(resolve).catch(reject);
        }, (error: any) => {
          console.error('Google Sign-In Error:', error);
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
}
