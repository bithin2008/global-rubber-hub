import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { refresh, wifi } from 'ionicons/icons';

@Component({
  selector: 'app-no-internet',
  templateUrl: './no-internet.component.html',
  styleUrls: ['./no-internet.component.scss'],
  standalone: true,
  imports: [IonContent, IonButton, IonIcon, CommonModule]
})
export class NoInternetComponent implements OnInit, OnDestroy {
  isOnline: boolean = navigator.onLine;
  private onlineListener?: () => void;
  private offlineListener?: () => void;

  constructor() {
    addIcons({ refresh, wifi });
  }

  ngOnInit() {
    // Listen for online/offline events
    this.onlineListener = () => {
      this.isOnline = true;
      // Auto-refresh the page when connection is restored
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    };

    this.offlineListener = () => {
      this.isOnline = false;
    };

    window.addEventListener('online', this.onlineListener);
    window.addEventListener('offline', this.offlineListener);
  }

  ngOnDestroy() {
    // Clean up event listeners
    if (this.onlineListener) {
      window.removeEventListener('online', this.onlineListener);
    }
    if (this.offlineListener) {
      window.removeEventListener('offline', this.offlineListener);
    }
  }

  retryConnection() {
    if (navigator.onLine) {
      window.location.reload();
    } else {
      // Show a brief message that there's still no connection
      console.log('Still no internet connection');
    }
  }

  checkConnection() {
    // Force check the connection status
    this.isOnline = navigator.onLine;
    if (this.isOnline) {
      window.location.reload();
    }
  }
}
