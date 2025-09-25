/**
 * Authentication configuration file
 * Contains all authentication-related client IDs and configuration
 */

export const authConfig = {
  // App Configuration
  appName: 'Global Rubber Hub',
  version: '1.0.0',
  
  // Google Auth Configuration
  googleAuth: {
    // Android client ID (OAuth 2.0 client ID for Android)
    androidClientId: '5576336618943-s1deq0icisep54938nvch1nmk4f4ekj2.apps.googleusercontent.com',
    
    // iOS client ID (OAuth 2.0 client ID for iOS) - Usually same as Android for this plugin
    iosClientId: '5576336618943-s1deq0icisep54938nvch1nmk4f4ekj2.apps.googleusercontent.com',
    
    // Web client ID (OAuth 2.0 client ID for Web application) - Required for server-side verification
    webClientId: '5576336618943-s1deq0icisep54938nvch1nmk4f4ekj2.apps.googleusercontent.com',
    
    // Scopes
    scopes: ['profile', 'email'],
    
    // Grant offline access
    grantOfflineAccess: true
  }
};
