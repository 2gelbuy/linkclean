import { trackEvent, trackInstall } from '@/lib/analytics';
import { resetSessionCount } from '@/lib/filters';

const UNINSTALL_URL = 'https://konabayev.com/linkclean/uninstall/';

export default defineBackground(() => {
  // Badge state
  let sessionTotal = 0;

  chrome.runtime.onInstalled.addListener(async (details) => {
    if (details.reason === 'install') {
      await trackInstall();
      chrome.runtime.setUninstallURL(UNINSTALL_URL);
    } else if (details.reason === 'update') {
      await trackEvent('update', {
        from: details.previousVersion ?? 'unknown',
        to: chrome.runtime.getManifest().version,
      });
      chrome.runtime.setUninstallURL(UNINSTALL_URL);
    }
  });

  // Listen for hidden post counts from content script
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'linkclean:hidden') {
      sessionTotal += message.count;
      const text = sessionTotal > 999 ? '999+' : String(sessionTotal);
      chrome.action.setBadgeText({ text });
      chrome.action.setBadgeBackgroundColor({ color: '#2563eb' });
    }
  });

  // Reset session count on startup
  resetSessionCount();
});
