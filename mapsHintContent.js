(function () {
  const STORAGE_KEY = 'mapsHintDismissed';
  const FAILURE_BANNER_ID = 'gm-trip-failure-banner';

  const shouldShowHint = () => {
    if (typeof chrome === 'undefined' || !chrome.storage?.local) {
      return Promise.resolve(true);
    }
    return new Promise((resolve) => {
      try {
        chrome.storage.local.get(STORAGE_KEY, (result) => {
          resolve(!result || result[STORAGE_KEY] !== true);
        });
      } catch (err) {
        resolve(true);
      }
    });
  };

  const markHintDismissed = () => {
    if (typeof chrome === 'undefined' || !chrome.storage?.local) return;
    try {
      chrome.storage.local.set({ [STORAGE_KEY]: true }, () => {});
    } catch {
      // ignore
    }
  };

  const createHintBanner = () => {
    if (typeof document === 'undefined') return;
    if (!document.body) return;
    if (document.getElementById('gm-trip-helper-banner')) return;

    const banner = document.createElement('div');
    banner.id = 'gm-trip-helper-banner';
    banner.textContent =
      "🚐 You’re on Google Maps. Use the Trip Helper extension to manage routes with lots of stops.";
    Object.assign(banner.style, {
      position: 'fixed',
      bottom: '16px',
      right: '16px',
      zIndex: '999999',
      padding: '12px 14px',
      background: '#111827',
      color: '#e5e7eb',
      borderRadius: '10px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
      fontSize: '13px',
      lineHeight: '1.4',
      maxWidth: '260px',
      cursor: 'pointer',
      display: 'flex',
      gap: '8px',
      alignItems: 'center',
    });

    banner.addEventListener('click', () => {
      if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
        try {
          chrome.runtime.sendMessage({ type: 'openExtensionPopupHint' });
        } catch {
          // ignore
        }
      }
      markHintDismissed();
    });

    const close = document.createElement('button');
    close.textContent = '✕';
    Object.assign(close.style, {
      background: 'transparent',
      border: 'none',
      color: '#9ca3af',
      fontSize: '14px',
      cursor: 'pointer',
      marginLeft: 'auto',
      padding: '0',
      lineHeight: '1',
    });
    close.addEventListener('click', (event) => {
      event.stopPropagation();
      banner.remove();
      markHintDismissed();
    });

    banner.appendChild(close);
    document.body.appendChild(banner);
  };

  const showFailureBanner = () => {
    if (typeof document === 'undefined' || !document.body) return;
    const existing = document.getElementById(FAILURE_BANNER_ID);
    if (existing) return;
    const banner = document.createElement('div');
    banner.id = FAILURE_BANNER_ID;
    banner.textContent = '🚨 Route failed to load. Try fewer stops or adjust your route.';
    Object.assign(banner.style, {
      position: 'fixed',
      bottom: '16px',
      right: '16px',
      zIndex: '999999',
      padding: '12px 14px',
      background: '#dc2626',
      color: '#fef2f2',
      borderRadius: '10px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
      fontSize: '13px',
      lineHeight: '1.4',
      maxWidth: '280px',
      cursor: 'default',
      display: 'flex',
      gap: '8px',
      alignItems: 'center',
    });
    const close = document.createElement('button');
    close.textContent = '✕';
    Object.assign(close.style, {
      background: 'transparent',
      border: 'none',
      color: '#fecdd3',
      fontSize: '14px',
      cursor: 'pointer',
      marginLeft: 'auto',
      padding: '0',
      lineHeight: '1',
    });
    close.addEventListener('click', (event) => {
      event.stopPropagation();
      banner.remove();
    });
    banner.appendChild(close);
    document.body.appendChild(banner);
  };

  shouldShowHint().then((ok) => {
    if (ok) createHintBanner();
  });

  if (typeof chrome !== 'undefined' && chrome.runtime?.onMessage) {
    chrome.runtime.onMessage.addListener((message) => {
      if (!message || typeof message !== 'object') return;
      if (message.type === 'probeFailureNotice') {
        showFailureBanner();
      }
    });
  }
})();
