export const razorpayConfig = {
  // Test Environment
  test: {
    keyId: 'rzp_test_pukxv7Ki2WgVYL',
    secretKey: '9z45TWpGtdu9miD4kiT2KjQ3', // Replace with your actual secret key
    apiUrl: 'https://api.razorpay.com/v1'
  },
  
  // Production Environment
  production: {
    keyId: 'rzp_test_pukxv7Ki2WgVYL',
    secretKey: '9z45TWpGtdu9miD4kiT2KjQ3',
    apiUrl: 'https://api.razorpay.com/v1'
  }
};

// Get current environment
export const getRazorpayConfig = () => {
  const isProduction = window.location.hostname !== 'localhost' && 
                      window.location.hostname !== '127.0.0.1' &&
                      !window.location.hostname.includes('dev');
  
  return isProduction ? razorpayConfig.production : razorpayConfig.test;
};

// Helper function to create Basic Auth header
export const createAuthHeader = () => {
  const config = getRazorpayConfig();
  const credentials = `${config.keyId}:${config.secretKey}`;
  return 'Basic ' + btoa(credentials);
}; 