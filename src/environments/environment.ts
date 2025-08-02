// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {  
  production: false,
      API_ENDPOINT: 'https://globalrubberhub.com/api/v1/',
  GOOGLE_WEB_CLIENT_ID: '1067170807523-bijn3ku7s719261krv6p1fioq4uf1m3v.apps.googleusercontent.com', // Web client ID for browser
  GOOGLE_ANDROID_CLIENT_ID: '1067170807523-YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com', // Android client ID - needs to be configured in Google Console
  GOOGLE_SERVER_CLIENT_ID: '1067170807523-bijn3ku7s719261krv6p1fioq4uf1m3v.apps.googleusercontent.com' // Server client ID for backend verification
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
