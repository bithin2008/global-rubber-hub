import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';

declare var universalLinks: any;

@Injectable({
  providedIn: 'root'
})
export class DeepLinkService {

  constructor(
    private router: Router,
    private platform: Platform
  ) { }

  /**
   * Initialize deep linking
   */
  initializeDeepLinking() {
    this.platform.ready().then(() => {
      if (this.platform.is('cordova')) {
        // Handle deep links when app is already running
        document.addEventListener('deviceready', () => {
          if (typeof universalLinks !== 'undefined') {
            universalLinks.subscribe('globalrubberhub', (eventData: any) => {
              this.handleDeepLink(eventData);
            });
          }
        }, false);

        // Handle deep links when app is launched from a link
        document.addEventListener('deviceready', () => {
          if (typeof universalLinks !== 'undefined') {
            universalLinks.subscribe('globalrubberhub', (eventData: any) => {
              this.handleDeepLink(eventData);
            });
          }
        }, false);
      } else {
        // Web platform - handle URL changes
        this.handleWebDeepLinks();
      }
    });
  }

  /**
   * Handle deep links for web platform
   */
  private handleWebDeepLinks() {
    // Check if there's a deep link in the current URL
    const currentPath = window.location.pathname;
    const currentSearch = window.location.search;
    
    if (currentPath !== '/' || currentSearch) {
      // Extract path from URL
      const path = currentPath.substring(1); // Remove leading slash
      const params = this.parseQueryParams(currentSearch);
      
      console.log('Web deep link detected:', { path, params });
      this.navigateToPath(path, params);
    }

    // Listen for browser navigation events
    window.addEventListener('popstate', (event) => {
      const path = window.location.pathname.substring(1);
      const params = this.parseQueryParams(window.location.search);
      this.navigateToPath(path, params);
    });
  }

  /**
   * Parse query parameters from URL
   */
  private parseQueryParams(search: string): { [key: string]: string } {
    const params: { [key: string]: string } = {};
    if (search) {
      const urlParams = new URLSearchParams(search);
      urlParams.forEach((value, key) => {
        params[key] = value;
      });
    }
    return params;
  }

  /**
   * Handle incoming deep links
   */
  private handleDeepLink(eventData: any) {
    console.log('Deep link received:', eventData);
    
    const url = eventData.url;
    const path = this.extractPathFromUrl(url);
    
    if (path) {
      this.navigateToPath(path);
    }
  }

  /**
   * Extract path from deep link URL
   */
  private extractPathFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname;
    } catch (error) {
      console.error('Error parsing deep link URL:', error);
      return null;
    }
  }

  /**
   * Navigate to the specified path
   */
  private navigateToPath(path: string, params?: { [key: string]: string }) {
    // Remove leading slash if present
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    
    // Map deep link paths to app routes
    const routeMap: { [key: string]: string } = {
      'item': 'item-list',
      'item/add': 'item-add',
      'item/my': 'my-item',
      'bid/history': 'bid-history',
      'bid/request': 'bid-request',
      'profile': 'profile',
      'account': 'account',
      'notification': 'notification',
      'verify': 'verify-now',
      'trusted-seller': 'trusted-seller',
      'deep-link-demo': 'deep-link-demo'
    };

    const targetRoute = routeMap[cleanPath] || cleanPath;
    
    // Check if user is authenticated before navigating
    const isAuthenticated = localStorage.getItem('token');
    
    if (isAuthenticated) {
      this.router.navigate([targetRoute]);
    } else {
      // Store the intended route and redirect to login
      localStorage.setItem('deep_link_redirect', targetRoute);
      this.router.navigate(['/login']);
    }
  }

  /**
   * Handle deep link redirect after login
   */
  handlePostLoginRedirect() {
    const redirectPath = localStorage.getItem('deep_link_redirect');
    if (redirectPath) {
      localStorage.removeItem('deep_link_redirect');
      this.router.navigate([redirectPath]);
    }
  }

  /**
   * Create deep link URL for sharing
   */
  createDeepLink(path: string, params?: { [key: string]: string }): string {
    let url: string;
    
    if (this.platform.is('cordova')) {
      // Use production domain for mobile
      url = `https://globalrubberhub.com/${path}`;
    } else {
      // Use localhost for web testing
      url = `http://localhost:4200/${path}`;
    }
    
    if (params && Object.keys(params).length > 0) {
      const queryParams = new URLSearchParams(params);
      url += `?${queryParams.toString()}`;
    }
    
    return url;
  }

  /**
   * Test deep link navigation (for development)
   */
  testDeepLink(path: string, params?: { [key: string]: string }) {
    if (this.platform.is('cordova')) {
      // For mobile, create and open the deep link
      const link = this.createDeepLink(path, params);
      console.log('Testing deep link:', link);
      // You can use InAppBrowser or similar to test
    } else {
      // For web, navigate directly
      const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
      const fullPath = `/${path}${queryString}`;
      console.log('Testing web deep link:', fullPath);
      window.history.pushState({}, '', fullPath);
      this.navigateToPath(path, params);
    }
  }
}
