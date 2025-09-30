import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
// Cordova plugins will be available globally
declare var StatusBar: any;
declare var navigator: any;
import { Platform } from '@ionic/angular';
import { App } from '@capacitor/app';
import { DeepLinkService } from './services/deep-link.service';
import { ReferralService } from './services/referral.service';
import { Router } from '@angular/router';
import { LoaderComponent } from './shared/loader/loader.component';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet, LoaderComponent],
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private router: Router,
    private deepLinkService: DeepLinkService,
    private referralService: ReferralService
  ) {
    this.initializeApp();
    this.listenForDeepLinks();
  }

  initializeApp() {
    console.log('App component initialized');
    
    // Immediately try to hide splash screen
    this.hideSplashScreenImmediately();
    
    this.platform.ready().then(() => {
      console.log('Platform ready');
      
      // Initialize deep linking first
      this.deepLinkService.initializeDeepLinking();
      
      // Define handleOpenURL globally for Cordova Universal Links
      (window as any).handleOpenURL = (url: string) => {
        console.log('handleOpenURL called with:', url);
        // Use setTimeout to ensure app is fully initialized
        setTimeout(() => {
          this.deepLinkService.handleDeepLink({ url });
        }, 0);
      };
      
      // Configure status bar for proper header display
      this.configureStatusBar();
      
      // Hide splash screen immediately when platform is ready
      this.hideSplashScreen();
      
      // Additional fallback to hide splash screen after a short delay
      setTimeout(() => {
        this.hideSplashScreen();
      }, 500);
      
      // Final fallback after 1 second
      setTimeout(() => {
        this.hideSplashScreen();
      }, 1000);
      
      console.log('App initialization completed');
    }).catch(error => {
      console.error('Error during app initialization:', error);
      // Hide splash screen even if there's an error
      this.hideSplashScreen();
    });
  }

  listenForDeepLinks() {
    App.addListener('appUrlOpen', (event: any) => {
      if (event.url) {
        console.log('Deep link received in app component:', event.url);
        
        // Example: globalrubberhub://market/ENCRYPTEDTOKEN
        const slug = event.url.split('//')[1]; // "market/ENCRYPTEDTOKEN"
        const parts = slug.split('/');
        
        if (parts[0] === 'market') {
          const token = parts[1];
          console.log('Market token:', token);
          
          // Navigate to your item page
          this.router.navigate(['/item-list'], { 
            queryParams: { token: token } 
          });
        } else if (parts[0] === 'referral') {
          const referralCode = parts[1];
          console.log('Referral code:', referralCode);
          
          // Handle referral code
          this.referralService.handleReferralCode(referralCode);
        } else {
          // Use the deep link service for other links
          this.deepLinkService.handleDeepLink({ url: event.url });
        }
      }
    });
  }

  hideSplashScreenImmediately() {
    // Try to hide splash screen immediately when app starts
    setTimeout(() => {
      this.hideSplashScreen();
    }, 100);
  }

  hideSplashScreen() {
    try {
      console.log('Attempting to hide splash screen...');
      
      // Method 1: Try Cordova splash screen plugin
      if (typeof navigator !== 'undefined' && navigator.splashscreen) {
        navigator.splashscreen.hide();
        console.log('Splash screen hidden via navigator.splashscreen');
      }
      
      // Method 2: Try DOM manipulation
      this.hideSplashScreenViaDOM();
      
      // Method 3: Try to hide by CSS
      this.hideSplashScreenViaCSS();
      
    } catch (error) {
      console.error('Error hiding splash screen:', error);
    }
  }

  hideSplashScreenViaDOM() {
    // Try multiple selectors to find and hide splash screen elements
    const selectors = [
      '.splash-screen',
      '[data-splash]',
      '.cordova-splash',
      '#splash-screen',
      '.splash',
      '.splashscreen',
      '.splash-screen-container',
      '.cordova-splash-screen',
      '.android-splash',
      '.ios-splash',
      '.splashscreen-container',
      '.splash-container'
    ];

    selectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        (element as HTMLElement).style.display = 'none';
        (element as HTMLElement).style.visibility = 'hidden';
        (element as HTMLElement).style.opacity = '0';
        console.log(`Hidden splash element: ${selector}`);
      });
    });

    // Also try to hide any element with splash in the class name
    const allElements = document.querySelectorAll('*');
    allElements.forEach(element => {
      const className = element.className;
      if (typeof className === 'string' && className.toLowerCase().includes('splash')) {
        (element as HTMLElement).style.display = 'none';
        (element as HTMLElement).style.visibility = 'hidden';
        console.log(`Hidden splash element by class: ${className}`);
      }
    });
  }

  hideSplashScreenViaCSS() {
    // Add CSS to hide splash screen
    const style = document.createElement('style');
    style.textContent = `
      .splash-screen, [data-splash], .cordova-splash, #splash-screen, .splash, .splashscreen, 
      .splash-screen-container, .cordova-splash-screen, .android-splash, .ios-splash,
      .splashscreen-container, .splash-container {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
      }
    `;
    document.head.appendChild(style);
    console.log('Added CSS to hide splash screen');
  }

  configureStatusBar() {
    try {
      if (this.platform.is('android')) {
        // Set status bar style for Android using Cordova StatusBar plugin
        if (typeof StatusBar !== 'undefined') {
          StatusBar.styleLightContent();
          StatusBar.backgroundColorByHexString('#1A8135'); // Match header color
          StatusBar.show();
        }
      } else if (this.platform.is('ios')) {
        // Set status bar style for iOS using Cordova StatusBar plugin
        if (typeof StatusBar !== 'undefined') {
          StatusBar.styleLightContent();
        }
      }
    } catch (error) {
      console.error('Error configuring StatusBar:', error);
    }
  }
}
