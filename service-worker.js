const CACHE_NAME = 'obecure-offline-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/index.tsx',
  '/metadata.json',
  '/App.tsx',
  '/types.ts',
  '/components/Header.tsx',
  '/components/DietPlanner.tsx',
  '/components/LiveAssistant.tsx',
  '/components/DisclaimerModal.tsx',
  '/components/Faq.tsx',
  '/components/DrKenilsNote.tsx',
  '/components/GeneratingPlan.tsx',
  '/components/ProgressModal.tsx',
  '/components/LogSleep.tsx',
  '/components/LogSleepModal.tsx',
  '/components/ThemeToggle.tsx',
  '/components/icons/MagicWandIcon.tsx',
  '/components/icons/MicIcon.tsx',
  '/components/icons/StarIcon.tsx',
  '/components/icons/StopIcon.tsx',
  '/services/gemini.ts',
  '/data/notes.ts',
  '/data/workouts.ts',
  '/data/faq.ts',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Kalam:wght@400;700&display=swap',
  'https://aistudiocdn.com/react@^19.2.0',
  'https://aistudiocdn.com/react-dom@^19.2.0/client',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request).then(
          response => {
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            return response;
          }
        );
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
