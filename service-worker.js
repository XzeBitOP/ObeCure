const CACHE_NAME = 'obecure-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/index.tsx',
  '/App.tsx',
  '/types.ts',
  '/components/Header.tsx',
  '/components/DietPlanner.tsx',
  '/data/notes.ts',
  '/components/DrKenilsNote.tsx',
  '/components/DisclaimerModal.tsx',
  '/components/GeneratingPlan.tsx',
  '/components/ProgressModal.tsx',
  '/components/LogSleep.tsx',
  '/components/LogSleepModal.tsx',
  '/data/workouts.ts',
  '/components/Faq.tsx',
  '/data/faq.ts',
  '/components/icons/WebsiteIcon.tsx',
  '/components/icons/InstagramIcon.tsx',
  '/data/mealDatabase.ts',
  '/data/foodCalorieDatabase.ts',
  '/data/specialMeals.ts',
  '/services/offlinePlanGenerator.ts',
  '/data/quotes.ts',
  '/components/SuccessToast.tsx',
  '/components/icons/YouTubeIcon.tsx',
  '/components/InfoModal.tsx',
  '/components/icons/CheckIcon.tsx',
  '/components/icons/BreakfastIcon.tsx',
  '/components/icons/LunchIcon.tsx',
  '/components/icons/DinnerIcon.tsx',
  '/components/icons/SnackIcon.tsx',
  '/components/Workouts.tsx',
  '/components/SubscriptionModal.tsx',
  '/components/CongratulationsModal.tsx',
  '/components/icons/LeafIcon.tsx',
  '/components/icons/ShareIcon.tsx',
  '/components/icons/EditIcon.tsx',
  '/components/bioadaptive/BioAdaptivePlanner.tsx',
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
  '/manifest.json',
  '/service-worker.js',
  '/components/NotificationBell.tsx',
  '/components/Onboarding.tsx',
  '/components/InstallPwaModal.tsx',
  '/components/icons/InstallIcon.tsx',
  '/components/icons/MoreVerticalIcon.tsx',
  '/components/icons/WhatsAppIcon.tsx',
  '/components/icons/SwapIcon.tsx',
  '/components/WeeklyReportView.tsx',
  '/components/BodyComposition.tsx',
  '/services/bodyCompositionCalculator.ts',
  '/components/PieChart.tsx',
  '/components/RiskBar.tsx',
  '/components/icons/WaterIcon.tsx',
  '/components/icons/ChartBarIcon.tsx',
  '/components/icons/SearchIcon.tsx',
  '/components/CommunityView.tsx',
  '/components/PostVictoryModal.tsx',
  '/components/icons/UsersIcon.tsx',
  '/metadata.json',
  '/data/botPosts.ts',
  '/components/StreakTracker.tsx',
  '/data/motivationalLines.ts',
  '/components/icons/HeartIcon.tsx',
  '/components/SubscriptionLock.tsx',
  '/components/LogMealModal.tsx',
  '/services/googleFormSubmit.ts',
  '/components/icons/ForkAndSpoonIcon.tsx',
  '/components/icons/DumbbellIcon.tsx',
  '/logo.svg',
  '/components/MealHistoryModal.tsx',
  '/components/icons/HistoryIcon.tsx',
  '/components/icons/BrainIcon.tsx',
  '/services/gemini.ts',
  '/components/LiveAssistant.tsx',
  '/hooks/useLiveAssistant.ts',
  '/components/icons/MicIcon.tsx',
  '/components/icons/StopIcon.tsx',
  '/meals.txt',
  '/components/bioadaptive/GeneratingBioPlan.tsx',
  '/components/icons/StarIcon.tsx',
  '/components/ThemeToggle.tsx',
  '/components/BloodReportEvaluator.tsx',
  '/data/bloodTests.ts',
  '/components/icons/ClipboardListIcon.tsx',
  // PWA Icons
  '/icons/icon-16x16.png',
  '/icons/icon-32x32.png',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-180x180.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png',
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
  // We only want to handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const cachedResponse = await cache.match(event.request);

      if (cachedResponse) {
        // Return the cached response
        return cachedResponse;
      }

      try {
        // If not in cache, fetch from the network
        const networkResponse = await fetch(event.request);
        
        // A response is a stream and can only be consumed once.
        // We need to clone it to put one copy in cache and return one to the browser.
        const responseToCache = networkResponse.clone();

        // Cache the new response
        await cache.put(event.request, responseToCache);

        // Return the network response
        return networkResponse;
      } catch (error) {
        // Handle network errors (e.g., offline)
        console.error('Fetch failed:', error);
        // We don't have an offline fallback page specified in the cache,
        // so we just let the request fail.
        throw error;
      }
    })()
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
                const client = windowClients[0];
                for (let i = 0; i < windowClients.length; i++) {
                    if (windowClients[i].focused) {
                        return windowClients[i].focus();
                    }
                }
                if (client) {
                   return client.focus();
                }
            }
            return clients.openWindow('/');
        })
    );
});