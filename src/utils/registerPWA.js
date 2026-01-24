

export function registerPWA() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('✅ PWA: Service Worker registered successfully:', registration.scope);
          
          // Check for updates every hour
          setInterval(() => {
            registration.update();
          }, 60 * 60 * 1000);
          
          // Listen for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New content available
                console.log('🔄 PWA: New content available, reload to update');
                
                // Optionally show update notification
                if (window.confirm('New version available! Reload to update?')) {
                  window.location.reload();
                }
              }
            });
          });
        })
        .catch((error) => {
          console.error('❌ PWA: Service Worker registration failed:', error);
        });
    });
  }
}

// Check if app is running in standalone mode (installed)
export function isPWAInstalled() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  );
}

// Prompt user to install PWA
export function promptPWAInstall() {
  let deferredPrompt;
  
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent default prompt
    e.preventDefault();
    
    // Store for later use
    deferredPrompt = e;
    
    // Show custom install button/banner
    console.log('💾 PWA: Install prompt available');
    
    return deferredPrompt;
  });
  
  return deferredPrompt;
}

// Show install prompt
export async function showInstallPrompt(deferredPrompt) {
  if (!deferredPrompt) {
    console.log('⚠️ PWA: No install prompt available');
    return false;
  }
  
  // Show prompt
  deferredPrompt.prompt();
  
  // Wait for user response
  const { outcome } = await deferredPrompt.userChoice;
  
  console.log(`👤 PWA: User ${outcome} the install prompt`);
  
  // Clear deferred prompt
  deferredPrompt = null;
  
  return outcome === 'accepted';
}