
//importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

const CACHE = "pwa-offline-page";

// TODO: replace the following with the correct offline fallback page i.e.: const offlineFallbackPage = "offline.html";
const offlineFallbackPage = "index.html";
const fCache = [
  'https://vandraterhorst.github.io/PWA/',
  'js/pwa.js'
];
/*

if (workbox.navigationPreload.isSupported()) {
  workbox.navigationPreload.enable();

  workbox.routing.registerRoute(
    new RegExp('/*'),
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: CACHE
    })
  );
}
*/
/* 
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
       Registrar os eventos 
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
*/ 

self.addEventListener('install', async (event) => {
  event.waitUntil(
    caches.open(CACHE)
          .then((cache) => cache.addAll(fCache))
  );

  self.skipWaiting();  
});

self.addEventListener('push', (event) => {
  event.waitUntil(
    self.registration.showNotification('Titulo', {
      body: 'Mensagem',
      icon: 'favicon.png',
    })
  );
});

self.addEventListener('sync', event => {
  console.log('sincornzando os dados na primeira entrada');
  if (event.tag === 'database-sync') {
    event.waitUntil(
      upLocalDataBase()
    );
  }
});

self.addEventListener('periodicsync', event => {
  if (event.tag === 'database-sync-periodic') {
    console.log('Buscar os dados de novo');
    event.waitUntil(
      upLocalDataBase()
    );
  }
});

function upLocalDataBase() {
  return buscarDados({url: `https://reqres.in/api/users`})
                     .then(atualizaBD)
                    /* .then((dados) => self.registration.showNotification('Banco de dados Atualizado', {
                               body: `Total de dados atualizados: ${dados.length}`,
                               icon: 'favicon.png',
                             }                             
                           ))*/;
}

function buscarDados(request) {
  return fetch(request.url)
              .then(response => {
                 if (!response.ok) {
                   throw new Error('Sem internet');
                 }

                 // Fazer os tratamentos e guardar no banco
                 return caches.open('CACHE_DATABASE')
                              .then(cache => cache.put(request, response.clone()))
                              .then(() => response)
          })
}

function atualizaBD(response) {
  return response.json()
          .then(jsonResponse => {
            return jsonResponse.data;
          });
}



/*
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const preloadResp = await event.preloadResponse;

        if (preloadResp) {
          return preloadResp;
        }

        const networkResp = await fetch(event.request);
        return networkResp;
      } catch (error) {

        const cache = await caches.open(CACHE);
        const cachedResp = await cache.match(offlineFallbackPage);
        return cachedResp;
      }
    })());
  }
});
*/
