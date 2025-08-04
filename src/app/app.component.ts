import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
// Cordova plugins will be available globally
declare var StatusBar: any;
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  constructor(private platform: Platform) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Configure status bar for proper header display
      this.configureStatusBar();
      
      // Cordova splash screen will auto-hide based on config.xml preferences
      console.log('App initialized - Cordova splash screen configured');
    });
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
      console.log('Status bar configuration error:', error);
    }
  }
}
