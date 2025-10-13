import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { ToastModalComponent } from '../toast-modal/toast-modal.component';
import { ModalController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  private isHandlingLogout = false;
  private lastAuthCheckTime = 0;
  private isLoggingOut = false;
  private modalQueue: string[] = [];

  constructor(
    private router: Router,
    private modalController: ModalController
  ) {
    // Initialize authentication status
    this.checkTokenOnStartup();
  }

  /**
   * Check token on app startup
   */
  private checkTokenOnStartup(): void {
    const token = localStorage.getItem('token');
    if (token) {
      this.isAuthenticatedSubject.next(true);
    } else {
      this.isAuthenticatedSubject.next(false);
    }
  }

  /**
   * Global method to check token and handle authentication
   * This method should be called in ngOnInit of each component
   */
  async checkTokenAndAuthenticate(): Promise<boolean> {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.log('No token found, logging out user');
        // Check if we're already on the login page
        const currentUrl = this.router.url;
        const isAlreadyOnLoginPage = currentUrl.includes('/login');
        
        if (!isAlreadyOnLoginPage) {
          // Set timestamp to prevent duplicate messages
          this.lastAuthCheckTime = Date.now();
          
          // Show message for accessing protected page without authentication
          await this.showToast('warning', 'Authentication Required', 'Please login to access this page', 3000, '');
          
          // Clear storage and navigate
          localStorage.clear();
          this.isAuthenticatedSubject.next(false);
          this.router.navigate(['/login']);
        }
        return false;
      }

      // Token exists, consider user authenticated
      this.isAuthenticatedSubject.next(true);
      return true;

    } catch (error) {
      console.error('Error checking token:', error);
      // Check if we're already on the login page
      const currentUrl = this.router.url;
      const isAlreadyOnLoginPage = currentUrl.includes('/login');
      
      if (!isAlreadyOnLoginPage) {
        // Show message for authentication error
        await this.showToast('error', 'Authentication Error', 'Please login again to continue', 3000, '');
        
        // Clear storage and navigate
        localStorage.clear();
        this.isAuthenticatedSubject.next(false);
        this.router.navigate(['/login']);
      }
      return false;
    }
  }

  /**
   * Handle 401 error globally
   * This method should be called whenever a 401 error is received
   */
  async handle401Error(message: string = 'Session expired. Please login again'): Promise<void> {
    console.log('Handling 401 error - logging out user');
    
    // Check if we're already handling logout or logging out to prevent duplicate messages
    if (this.isHandlingLogout || this.isLoggingOut) {
      console.log('Already handling logout or logging out, skipping duplicate message');
      return;
    }
    
    // Check if we're already on the login page
    const currentUrl = this.router.url;
    const isAlreadyOnLoginPage = currentUrl.includes('/login');
    
    // Check if a recent authentication check was performed (within last 3 seconds)
    const timeSinceLastCheck = Date.now() - this.lastAuthCheckTime;
    if (timeSinceLastCheck < 3000) {
      console.log('Recent auth check performed, skipping duplicate message');
      return;
    }
    
    // Check if this message is already in the queue
    if (this.modalQueue.includes(message)) {
      console.log('Message already in queue, skipping duplicate');
      return;
    }
    
    if (!isAlreadyOnLoginPage) {
      await this.logoutUser(message);
    }
  }

  /**
   * Logout user and clear all data
   */
  async logoutUser(message: string = 'You have been logged out'): Promise<void> {
    try {
      // Set flags to prevent duplicate messages and track logout state
      this.isHandlingLogout = true;
      this.isLoggingOut = true;
      
      // Add message to queue to prevent duplicates
      this.modalQueue.push(message);
      
      // Clear all local storage
      localStorage.clear();
      
      // Update authentication status
      this.isAuthenticatedSubject.next(false);
      
      // Check if we're already on the login page
      const currentUrl = this.router.url;
      const isAlreadyOnLoginPage = currentUrl.includes('/login');
      
      // Only show logout message if we're not already on the login page
      if (!isAlreadyOnLoginPage) {
        await this.showToast('warning', 'Logged Out', message, 3000, '');
      }
      
      // Navigate to login page only if not already there
      if (!isAlreadyOnLoginPage) {
        this.router.navigate(['/login']);
      }
      
      // Reset flags after navigation
      setTimeout(() => {
        this.isHandlingLogout = false;
        this.isLoggingOut = false;
        this.modalQueue = []; // Clear the queue
      }, 2000);
      
    } catch (error) {
      console.error('Error during logout:', error);
      // Force navigation even if toast fails
      const currentUrl = this.router.url;
      const isAlreadyOnLoginPage = currentUrl.includes('/login');
      if (!isAlreadyOnLoginPage) {
        this.router.navigate(['/login']);
      }
      
      // Reset flags even on error
      setTimeout(() => {
        this.isHandlingLogout = false;
        this.isLoggingOut = false;
        this.modalQueue = []; // Clear the queue
      }, 2000);
    }
  }

  /**
   * Get current authentication status
   */
  isUserAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  /**
   * Get token from localStorage
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Check if a non-empty token exists in localStorage
   */
  hasToken(): boolean {
    const token = localStorage.getItem('token');
    return !!(token && token.trim().length > 0);
  }

  /**
   * Set token in localStorage
   */
  setToken(token: string): void {
    localStorage.setItem('token', token);
    this.isAuthenticatedSubject.next(true);
  }

  /**
   * Clear token and logout
   */
  clearToken(): void {
    localStorage.removeItem('token');
    this.isAuthenticatedSubject.next(false);
  }

  /**
   * Show toast message
   */
  private async showToast(
    status: string,
    message: string,
    submessage: string,
    timer: number,
    redirect: string
  ): Promise<void> {
    try {
      const modal = await this.modalController.create({
        component: ToastModalComponent,
        cssClass: 'toast-modal',
        componentProps: {
          status: status,
          message: message,
          submessage: submessage,
          timer: timer,
          redirect: redirect
        }
      });
      await modal.present();
    } catch (error) {
      console.error('Error showing toast:', error);
    }
  }
}
