const CACHE_NAME = 'obecure-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/index.tsx',
  '/App.tsx',
  '/types.ts',
  '/components/Header.tsx',
  '/components/DietPlanner.tsx',
  '/components/Workouts.tsx',
  '/components/DisclaimerModal.tsx',
  '/components/Faq.tsx',
  '/components/icons/WebsiteIcon.tsx',
  '/components/icons/InstagramIcon.tsx',
  '/components/NotificationBell.tsx',
  '/components/LogSleepModal.tsx',
  '/components/ProgressModal.tsx',
  '/components/SubscriptionModal.tsx',
  '/components/CongratulationsModal.tsx',
  '/components/bioadaptive/BioAdaptivePlanner.tsx',
  '/components/icons/LeafIcon.tsx',
  '/services/gemini.ts',
  '/components/icons/StarIcon.tsx',
  '/data/notes.ts',
  '/components/DrKenilsNote.tsx',
  '/components/GeneratingPlan.tsx',
  '/data/quotes.ts',
  '/components/SuccessToast.tsx',
  '/data/workouts.ts',
  '/data/faq.ts',
  '/data/mealDatabase.ts',
  '/data/specialMeals.ts',
  '/services/offlinePlanGenerator.ts',
  '/meals.txt',
  '/components/icons/YouTubeIcon.tsx',
  '/components/InfoModal.tsx',
  '/components/icons/CheckIcon.tsx',
  '/components/icons/BreakfastIcon.tsx',
  '/components/icons/LunchIcon.tsx',
  '/components/icons/DinnerIcon.tsx',
  '/components/icons/SnackIcon.tsx',
  '/components/LogSleep.tsx',
  '/components/icons/ShareIcon.tsx',
  '/components/icons/EditIcon.tsx',
  '/components/bioadaptive/BaselineForm.tsx',
  '/components/bioadaptive/DailyCheckinForm.tsx',
  '/components/bioadaptive/DailyPlanView.tsx',
  '/bioadaptive/constants.ts',
  '/bioadaptive/repository.ts',
  '/bioadaptive/scoring.ts',
  '/bioadaptive/phenotypes.ts',
  '/bioadaptive/rules.ts',
  '/bioadaptive/plannerService.ts',
  '/bioadaptive/pdfService.ts',
  '/bioadaptive/guardrails.ts',
  '/components/InstallPwaModal.tsx',
  '/components/icons/InstallIcon.tsx',
  '/components/icons/MoreVerticalIcon.tsx',
  '/components/icons/WhatsAppIcon.tsx',
  '/components/BodyComposition.tsx',
  '/services/bodyCompositionCalculator.ts',
  '/components/PieChart.tsx',
  '/components/RiskBar.tsx',
  '/components/icons/WaterIcon.tsx',
  '/components/icons/ChartBarIcon.tsx',
  '/metadata.json',
  '/manifest.json',
  // External assets
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Kalam:wght@400;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js',
  'https://aistudiocdn.com/react@^19.2.0',
  'https://aistudiocdn.com/react-dom@^19.2.0/client',
  'https://aistudiocdn.com/react@^19.2.0/jsx-runtime',
  'https://aistudiocdn.com/@google/genai@^1.28.0'
];

// --- SERVICE WORKER EVENT LISTENERS ---

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        const promises = urlsToCache.map(url => {
          return cache.add(new Request(url, {cache: 'reload'})).catch(err => console.warn(`Failed to cache ${url}: ${err}`));
        });
        return Promise.all(promises);
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) return response;
        return fetch(event.request).then((response) => {
            if (!response || response.status !== 200) return response;
            if (response.type === 'opaque' || response.type === 'basic') {
                const responseToCache = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseToCache);
                });
            }
            return response;
        });
      })
  );
});

self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) =>
            Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            )
        )
    );
});

self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
            if (windowClients.length > 0) {
                return windowClients[0].focus();
            } else {
                return clients.openWindow('/');
            }
        })
    );
});