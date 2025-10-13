// Import Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize Firebase in the service worker
firebase.initializeApp({
  apiKey: "AIzaSyCrnkAqySAnH2fRyuJKZAkejhbR4vrFMmc",
  authDomain: "global-rubber-hub-c754f.firebaseapp.com",
  projectId: "global-rubber-hub-c754f",
  storageBucket: "global-rubber-hub-c754f.firebasestorage.app",
  messagingSenderId: "826183488369",
  appId: "1:826183488369:web:f6f423f0d59d8d44829cd0"
});

// Initialize Firebase Cloud Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/assets/icon/icon.png',
    badge: '/assets/icon/icon.png',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  // Handle notification click action
  if (event.notification.data && event.notification.data.route) {
    event.waitUntil(
      clients.openWindow(event.notification.data.route)
    );
  }
});
