import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notification {
  id: number;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
}

export interface NotificationState {
  results: Notification[];
  unreadCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<NotificationState>({
    results: [],
    unreadCount: 0
  });

  notifications$ = this.notificationsSubject.asObservable();

  constructor() {}

  /**
   * Update notifications with new data
   */
  updateNotifications(notifications:any) {
   // const unreadCount = notifications.filter(n => !n.read).length;
    const unreadCount = notifications;
    this.notificationsSubject.next({
      results: notifications,
      unreadCount
    });
  }

  /**
   * Add a single notification
   */
  addNotification(notification: Notification) {
    const currentState = this.notificationsSubject.value;
    const updatedNotifications = [notification, ...currentState.results];
    const unreadCount = updatedNotifications.filter(n => !n.read).length;
    
    this.notificationsSubject.next({
      results: updatedNotifications,
      unreadCount
    });
  }

  /**
   * Mark a notification as read
   */
  markAsRead(notificationId: number) {
    const currentState = this.notificationsSubject.value;
    const updatedNotifications = currentState.results.map(notification => {
      if (notification.id === notificationId) {
        return { ...notification, read: true };
      }
      return notification;
    });
    
    const unreadCount = updatedNotifications.filter(n => !n.read).length;
    
    this.notificationsSubject.next({
      results: updatedNotifications,
      unreadCount
    });
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead() {
    const currentState = this.notificationsSubject.value;
    const updatedNotifications = currentState.results.map(notification => ({
      ...notification,
      read: true
    }));
    
    this.notificationsSubject.next({
      results: updatedNotifications,
      unreadCount: 0
    });
  }

  /**
   * Clear all notifications
   */
  clearNotifications() {
    this.notificationsSubject.next({
      results: [],
      unreadCount: 0
    });
  }

  /**
   * Get current notification state
   */
  getCurrentState(): NotificationState {
    return this.notificationsSubject.value;
  }
}
