// firebase-messaging-sw.js
// Service Worker para notificações push com Firebase Cloud Messaging
// Este arquivo DEVE ficar na raiz do repositório

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey:            "AIzaSyD8WLll6pUis8wqVNZJJD0drDMZA-MW7DU",
  authDomain:        "convoqueme-f97c6.firebaseapp.com",
  projectId:         "convoqueme-f97c6",
  storageBucket:     "convoqueme-f97c6.firebasestorage.app",
  messagingSenderId: "614070262253",
  appId:             "1:614070262253:web:682b241a9aded71e192fe4"
});

const messaging = firebase.messaging();

// Recebe push com app em background/fechado
messaging.onBackgroundMessage(payload => {
  console.log('[SW] Push recebido em background:', payload);
  const { title, body, icon } = payload.notification || {};
  self.registration.showNotification(title || '🔔 ConvoqueMe', {
    body:    body    || 'Você foi convocado!',
    icon:    icon    || '/convoqueme/icon-192.png',
    badge:              '/convoqueme/icon-192.png',
    tag:               'convoqueme-call',
    renotify:           true,
    requireInteraction: true,          // fica na tela até o usuário interagir
    vibrate: [400, 100, 400, 100, 400, 100, 400],
    actions: [
      { action: 'accept',  title: '✅ Aceitar'  },
      { action: 'decline', title: '❌ Recusar'  }
    ],
    data: payload.data || {}
  });
});

// Clique na notificação
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = '/convoqueme/';
  if (event.action === 'accept' || event.action === 'decline') {
    // Abre o app e passa a ação via URL
    event.waitUntil(clients.openWindow(url + '?action=' + event.action + '&callId=' + (event.notification.data.callId || '')));
  } else {
    event.waitUntil(clients.openWindow(url));
  }
});

// Cache básico para funcionar offline
const CACHE = 'convoqueme-v1';
const PRECACHE = ['/convoqueme/', '/convoqueme/index.html', '/convoqueme/manifest.json'];

self.addEventListener('install',  e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(PRECACHE))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', e => {
  if(e.request.method !== 'GET') return;
  e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)));
});
