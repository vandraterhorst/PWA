let deferredPrompt; // Allows to show the install prompt
let setupButton;

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault();
  // Stash the event so it can be triggered later.
  deferredPrompt = e;
  console.log("beforeinstallprompt fired");
  if (setupButton === undefined) {
    setupButton = document.getElementById("setup_button");
  }
  // Show the setup button
  setupButton.style.display = "inline";
  setupButton.disabled = false;
});

window.addEventListener('appinstalled', (evt) => {
  console.log("appinstalled fired", evt);
});

window.onload = () => {
  'use strict';
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js');
    navigator.serviceWorker.ready
            .then(registration => registration.sync.register('syncAttendees'))
            .then(() => console.log("Registered background sync"))
            .catch(err => console.error("Error registering background sync", err));

  }
};

function installApp() {
  // Show the prompt
  deferredPrompt.prompt();
  setupButton.disabled = true;
  // Wait for the user to respond to the prompt
  deferredPrompt.userChoice
          .then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
              console.log('PWA setup accepted');
              // hide our user interface that shows our A2HS button
              setupButton.style.display = 'none';
            } else {
              console.log('PWA setup rejected');
            }
            deferredPrompt = null;
          });
}

function registerNotification() {
  Notification.requestPermission(permission => {
    if (permission === 'granted') {
      registerBackgroundSync();
    } else
      console.error("Permission was not granted.");
  });
}

function registerBackgroundSync() {
  if (!navigator.serviceWorker) {
    return console.error("Service Worker not supported");
  }

  navigator.serviceWorker.ready
          .then(registration => registration.sync.register('syncAttendees'))
          .then(() => console.log("Registered background sync"))
          .catch(err => console.error("Error registering background sync", err));
}
