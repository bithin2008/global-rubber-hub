import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'Global Rubber Hub',
  webDir: 'www',
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: "#1F272A",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '1067170807523-bijn3ku7s719261krv6p1fioq4uf1m3v.apps.googleusercontent.com'
    },
  }
}

export default config;
