import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'Global Rubber Hub',
  webDir: 'www',
  plugins: {
    SplashScreen: {
      launchShowDuration: 1000,
      launchAutoHide: true,
      backgroundColor: "#ffffff",
      showSpinner: false,
      splashFullScreen: false,
      splashImmersive: false
    },
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '1067170807523-bijn3ku7s719261krv6p1fioq4uf1m3v.apps.googleusercontent.com'
    },
  }
}

export default config;
