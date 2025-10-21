// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {  
  production: false,
  API_ENDPOINT: 'https://globalrubberhub.com/api/v1/',
  Razor_Pay_KeyId: 'rzp_test_pukxv7Ki2WgVYL',
  firebase: {
    // apiKey: 'AIzaSyDbr69b8iu44y3WPF4GlF2jLABWuCPHP-U',
    // authDomain: 'global-rubber-hub-c754f.firebaseapp.com',
    // projectId: 'global-rubber-hub-c754f',
    // storageBucket: 'global-rubber-hub-c754f.firebasestorage.app',
    // messagingSenderId: '826183488369',
    // appId: '1:826183488369:android:3074175a90a1984c829cd0',
    // measurementId: 'G-XXXXXXXXXX', // You'll need to get this from Firebase Console > Project Settings > General
    // webClientId: '576336618943-s1deq0icisep54938nvch1nmk4f4ekj2.apps.googleusercontent.com' // Replace with your actual web client ID

    webClientId: '826183488369-itvh47edlesonfsq06vrgphvmkpf70ja.apps.googleusercontent.com',
    androidClientId: '826183488369-9cb19ikmqo929a92crssfchglsnpm0m4.apps.googleusercontent.com',
    apiKey: "AIzaSyCrnkAqySAnH2fRyuJKZAkejhbR4vrFMmc",
    authDomain: "global-rubber-hub-c754f.firebaseapp.com",
    projectId: "global-rubber-hub-c754f",
    storageBucket: "global-rubber-hub-c754f.firebasestorage.app",
    messagingSenderId: "826183488369",
    appId: "1:826183488369:web:f6f423f0d59d8d44829cd0",
    vapidKey: "BEl62iUYgUivxIkv69yViEuiBIa40HI8lF8xS-uXKzSJQvYQ3Xw3EJVjS1QJ4Bq9N7t8U9vY6rE2wQ1A3sD4fG5hJ6kL7mN8oP9qR0sT1uV2wX3yZ4" // Replace with your actual VAPID key
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
