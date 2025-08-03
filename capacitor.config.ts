import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.globalrubber.hub',
  appName: 'Global Rubber Hub',
  webDir: 'www',
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: "#1f272a",
      androidSplashResourceName: "splash",
      androidScaleType: "FIT_XY",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#999999",
      layoutName: "",
      useDialog: false
    },
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '1067170807523-skqbcodkktsctbuvkltjosnaok60j7l2.apps.googleusercontent.com',
      forceCodeForRefreshToken: true
    },
  }
}

export default config;
