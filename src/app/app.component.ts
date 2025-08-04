import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
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
      
      // Let Capacitor handle the splash screen automatically
      // with the configuration from capacitor.config.ts
      console.log('App initialized - splash screen will auto-hide');
    });
  }

  async configureStatusBar() {
    try {
      if (this.platform.is('android')) {
        // Set status bar style for Android
        await StatusBar.setStyle({ style: Style.Light });
        await StatusBar.setBackgroundColor({ color: '#1A8135' }); // Match header color
        await StatusBar.setOverlaysWebView({ overlay: false }); // Don't overlay content
      } else if (this.platform.is('ios')) {
        // Set status bar style for iOS
        await StatusBar.setStyle({ style: Style.Light });
      }
    } catch (error) {
      console.log('Status bar configuration error:', error);
    }
  }
}
