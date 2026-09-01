// OneSignal Official Web Push Service Worker for Zain Dental Clinic
importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");

try {
  importScripts("./sw.js");
} catch (e) {
  try {
    importScripts("/sw.js");
  } catch (err) {}
}

