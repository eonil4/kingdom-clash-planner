export function registerServiceWorker() {
  if ('serviceWorker' in navigator && navigator.serviceWorker) {
    window.addEventListener('load', () => {
      if (navigator.serviceWorker) {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('SW registered:', registration);
          })
          .catch((error) => {
            console.log('SW registration failed:', error);
          });
      }
    });
  }
}
