import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class InternetService {
  private isOnlineSubject = new BehaviorSubject<boolean>(navigator.onLine);
  public isOnline$: Observable<boolean> = this.isOnlineSubject.asObservable();

  private onlineListener?: () => void;
  private offlineListener?: () => void;

  constructor(private platform: Platform) {
    this.initializeListeners();
  }

  private initializeListeners() {
    // Listen for online/offline events
    this.onlineListener = () => {
      this.isOnlineSubject.next(true);
      console.log('Internet connection restored');
    };

    this.offlineListener = () => {
      this.isOnlineSubject.next(false);
      console.log('Internet connection lost');
    };

    // Add event listeners
    window.addEventListener('online', this.onlineListener);
    window.addEventListener('offline', this.offlineListener);

    // For mobile platforms, also check periodically
    if (this.platform.is('capacitor')) {
      this.startPeriodicCheck();
    }
  }

  private startPeriodicCheck() {
    // Check connection every 30 seconds on mobile
    setInterval(() => {
      this.checkConnection();
    }, 30000);
  }

  public get isOnline(): boolean {
    return this.isOnlineSubject.value;
  }

  public checkConnection(): Promise<boolean> {
    return new Promise((resolve) => {
      if (!navigator.onLine) {
        this.isOnlineSubject.next(false);
        resolve(false);
        return;
      }

      // Try to fetch a small resource to verify connection
      const img = new Image();
      const timeout = setTimeout(() => {
        this.isOnlineSubject.next(false);
        resolve(false);
      }, 5000);

      img.onload = () => {
        clearTimeout(timeout);
        this.isOnlineSubject.next(true);
        resolve(true);
      };

      img.onerror = () => {
        clearTimeout(timeout);
        this.isOnlineSubject.next(false);
        resolve(false);
      };

      // Use a small image or favicon to test connection
      img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    });
  }

  public async waitForConnection(): Promise<boolean> {
    return new Promise((resolve) => {
      if (this.isOnline) {
        resolve(true);
        return;
      }

      const subscription = this.isOnline$.subscribe((online) => {
        if (online) {
          subscription.unsubscribe();
          resolve(true);
        }
      });
    });
  }

  public destroy() {
    // Clean up event listeners
    if (this.onlineListener) {
      window.removeEventListener('online', this.onlineListener);
    }
    if (this.offlineListener) {
      window.removeEventListener('offline', this.offlineListener);
    }
  }
}

