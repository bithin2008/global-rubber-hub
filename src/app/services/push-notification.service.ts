import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { FirebaseService } from './firebase.service';
import { CommonService } from './common-service';

@Injectable({
  providedIn: 'root'
})
export class PushNotificationService {
  private isInitialized = false;

  constructor(
    private platform: Platform,
    private firebaseService: FirebaseService,
    private commonService: CommonService
  ) {}

  /**
   * Initialize push notifications
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      if (this.platform.is('capacitor')) {
        await this.initializeCapacitorPushNotifications();
      } else {
        await this.initializeWebPushNotifications();
      }
      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing push notifications:', error);
    }
  }

  /**
   * Initialize Capacitor push notifications
   */
  private async initializeCapacitorPushNotifications(): Promise<void> {
    const { PushNotifications } = await import('@capacitor/push-notifications');
    
    // Request permission
    const permStatus = await PushNotifications.requestPermissions();
    if (permStatus.receive === 'granted') {
      // Register with Apple / Google to receive push via APNS/FCM
      await PushNotifications.register();

      // Listen for registration
      PushNotifications.addListener('registration', (token) => {
        console.log('Registration token: ', token.value);
        this.sendTokenToBackend(token.value);
      });

      // Listen for registration errors
      PushNotifications.addListener('registrationError', (err) => {
        console.error('Registration error: ', err.error);
      });

      // Listen for push notifications
      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('Push notification received: ', notification);
        this.handleNotificationReceived(notification);
      });

      // Listen for push notification actions
      PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
        console.log('Push notification action performed', notification.actionId, notification.inputValue);
        this.handleNotificationAction(notification);
      });
    }
  }

  /**
   * Initialize web push notifications
   */
  private async initializeWebPushNotifications(): Promise<void> {
    // Check if service worker is supported
    if ('serviceWorker' in navigator) {
      try {
        // Register service worker
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        console.log('Service Worker registered:', registration);
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }

    // Request notification permission
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        console.log('Notification permission granted');
      } else {
        console.log('Notification permission denied');
      }
    }
  }

  /**
   * Send FCM token to backend
   */
  private sendTokenToBackend(token: string): void {
    const tokenData = {
      fcmToken: token,
      platform: this.platform.is('capacitor') ? 'mobile' : 'web'
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

  /**
   * Handle notification received
   */
  private handleNotificationReceived(notification: any): void {
    // Show local notification or update UI
    console.log('Notification received:', notification);
    
    // You can show a toast, modal, or update UI here
    if (notification.title && notification.body) {
      this.showLocalNotification(notification.title, notification.body);
    }
  }

  /**
   * Handle notification action
   */
  private handleNotificationAction(notification: any): void {
    console.log('Notification action performed:', notification);
    
    // Handle different actions based on notification data
    if (notification.notification && notification.notification.data) {
      const data = notification.notification.data;
      
      // Navigate to specific page based on notification data
      if (data.route) {
        // You can inject Router and navigate here
        console.log('Navigate to:', data.route);
      }
    }
  }

  /**
   * Show local notification
   */
  private showLocalNotification(title: string, body: string): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body: body,
        icon: '/assets/icon/icon.png'
      });
    }
  }

  /**
   * Get FCM token
   */
  getFCMToken(): string | null {
    return this.firebaseService.getFCMToken();
  }

  /**
   * Subscribe to topic
   */
  subscribeToTopic(topic: string): void {
    const tokenData = {
      topic: topic,
      fcmToken: this.getFCMToken()
    };

    this.commonService.post('user/subscribe-topic', tokenData).subscribe(
      (response: any) => {
        console.log('Subscribed to topic:', topic);
      },
      (error) => {
        console.error('Error subscribing to topic:', error);
      }
    );
  }

  /**
   * Unsubscribe from topic
   */
  unsubscribeFromTopic(topic: string): void {
    const tokenData = {
      topic: topic,
      fcmToken: this.getFCMToken()
    };

    this.commonService.post('user/unsubscribe-topic', tokenData).subscribe(
      (response: any) => {
        console.log('Unsubscribed from topic:', topic);
      },
      (error) => {
        console.error('Error unsubscribing from topic:', error);
      }
    );
  }
}
