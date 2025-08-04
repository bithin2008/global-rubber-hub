import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.globalrubber.hub',
  appName: 'Global Rubber Hub',
  webDir: 'www',
  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '1067170807523-skqbcodkktsctbuvkltjosnaok60j7l2.apps.googleusercontent.com',
      forceCodeForRefreshToken: true
    },
  }
}

export default config;
