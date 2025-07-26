import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '1067170807523-bijn3ku7s719261krv6p1fioq4uf1m3v.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
    },
  }
}

export default config;
