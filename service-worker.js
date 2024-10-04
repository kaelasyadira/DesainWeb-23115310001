const cache_name = 'v1';
const cache_assets = [
    'index.html',
    'contact.html',
    'about.html',
    'offline.html',
    'apps.js',
    'styles.css'
];

// Install event
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installed');
    event.waitUntil(
        caches.open(cache_name).then(
            (cache) => {
                console.log('Service Worker: Caching Files');
                return cache.addAll(cache_assets);  // Tambahkan "return" untuk memastikan proses selesai
            }
        )
    );
});

// Activate event
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activated');
    event.waitUntil(
        caches.keys().then(
            (cacheNames) => {
                return Promise.all(
                    cacheNames.map(
                        (cache) => {
                            if (cache !== cache_name) {
                                console.log('Service Worker: Clearing Old Cache');
                                return caches.delete(cache);
                            }
                        }
                    )
                );
            }
        )
    );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  console.log('Service Worker: Fetching');
  event.respondWith(
      caches.match(event.request).then(
          (response) => {
              if (response) {
                  return response; // Kembalikan respons dari cache
              }
              return fetch(event.request).then(
                  (fetchResponse) => {
                      // Hanya simpan respons jika statusnya 200
                      if (!fetchResponse || fetchResponse.status !== 200) {
                          return fetchResponse; // Kembalikan respons asli jika bukan 200
                      }
                      return caches.open(cache_name).then(
                          (cache) => {
                              cache.put(event.request, fetchResponse.clone());
                              return fetchResponse; // Kembalikan respons asli
                          }
                      );
                  }
              ).catch(
                  () => caches.match('offline.html') // Menampilkan halaman offline jika fetch gagal
              );
          }
      )
  );
});

