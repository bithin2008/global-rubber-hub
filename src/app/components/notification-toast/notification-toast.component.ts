import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonToast } from '@ionic/angular/standalone';

@Component({
  selector: 'app-notification-toast',
  templateUrl: './notification-toast.component.html',
  styleUrls: ['./notification-toast.component.scss'],
  standalone: true,
  imports: [CommonModule, IonToast]
})
export class NotificationToastComponent implements OnInit {
  @Input() notification: any = null;
  
  showToast = false;
  toastMessage = '';
  toastDuration = 3000;

  ngOnInit() {
    if (this.notification) {
      this.showNotification();
    }
  }

  showNotification() {
    if (this.notification.title && this.notification.body) {
      this.toastMessage = `${this.notification.title}: ${this.notification.body}`;
      this.showToast = true;
    }
  }

  onToastDismiss() {
    this.showToast = false;
    this.notification = null;
  }
}
