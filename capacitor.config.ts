import { CapacitorConfig } from '@capacitor/core';

const config: CapacitorConfig = {
  appId: 'com.globalrubber.hub',
  appName: 'Global Rubber Hub',
  webDir: 'www',
  cordova: {
    preferences: {
      ScrollEnabled: 'false',
      BackupWebStorage: 'none',
      SplashScreen: 'screen',
      SplashScreenDelay: '3000',
      SplashMaintainAspectRatio: 'true',
      FadeSplashScreenDuration: '300',
      SplashShowOnlyFirstTime: 'false',
      ShowSplashScreenSpinner: 'false',
      SplashScreenSpinnerColor: 'white',
      AutoHideSplashScreen: 'true',
      SplashScreenBackgroundColor: '#1f272a',
      orientation: 'portrait'
    }
  },
  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '1067170807523-skqbcodkktsctbuvkltjosnaok60j7l2.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
    },
    Camera: {
      androidXMigrationWarnings: true,
      permissions: true
    },
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: "#1f272a",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true
    }
  },
};

export default config;
