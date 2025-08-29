import { type CapacitorConfig } from '@capacitor/cli';
import { authConfig } from './src/app/config/auth.config';

const config: CapacitorConfig = {
  appId: 'com.globalrubber.hub',
  appName: 'Global Rubber Hub',
  webDir: 'www',
  plugins: {
    GoogleAuth: {
      scopes: authConfig.scopes,
      serverClientId: authConfig.googleAuth.serverClientId,
      androidClientId: authConfig.googleAuth.androidClientId,
      clientId: authConfig.googleAuth.webClientId,
      forceCodeForRefreshToken: authConfig.forceCodeForRefreshToken
    }
  }
};

export default config;
