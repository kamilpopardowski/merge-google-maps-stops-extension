(function () {
  const STORAGE_KEY = 'mapsHintDismissed';

  const shouldShow = () => {
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

  const markDismissed = () => {
    if (typeof chrome === 'undefined' || !chrome.storage?.local) return;
    try {
      chrome.storage.local.set({ [STORAGE_KEY]: true }, () => {});
    } catch (err) {
      // ignore
    }
  };

  const createBanner = () => {
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
        } catch (err) {
          // ignore
        }
      }
      markDismissed();
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
      markDismissed();
    });

    banner.appendChild(close);
    document.body.appendChild(banner);
  };

  shouldShow().then((ok) => {
    if (ok) createBanner();
  });
})();
