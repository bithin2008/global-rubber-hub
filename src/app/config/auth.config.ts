/**
 * Authentication configuration file
 * Contains all authentication-related client IDs and configuration
 */

export const authConfig = {
  // Google OAuth Client IDs
  googleAuth: {
    // Use the Web application client ID for web and server
    webClientId: '576336618943-qqbnlurcabtchp02f9mpavdg52er7ej1.apps.googleusercontent.com',
    // Server client ID should be the same as web client ID
    serverClientId: '576336618943-qqbnlurcabtchp02f9mpavdg52er7ej1.apps.googleusercontent.com',
    // Android client ID should be different and specific to Android
    androidClientId: '576336618943-android-specific-client-id.apps.googleusercontent.com',
  },

  // OAuth Scopes
  scopes: ['profile', 'email'],

  // Additional OAuth Configuration
  grantOfflineAccess: true,
  forceCodeForRefreshToken: true
};
