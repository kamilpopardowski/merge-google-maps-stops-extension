(function () {
  const MAX_MS = 12000;
  const INTERVAL_MS = 900;
  let done = false;

  const sendStatus = (status) => {
    if (done) return;
    done = true;
    try {
      if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
        chrome.runtime.sendMessage({ type: 'testMergedRouteResult', status });
      }
    } catch (err) {
      // ignore
    }
  };

  const hasSuccessSignals = () => {
    try {
      const selectors = [
        '[aria-label*="Directions"]',
        '[aria-label*="Route options"]',
        '[data-tooltip*="Directions"]',
        '[role="article"]',
        '.section-directions-trip',
      ];
      for (const sel of selectors) {
        if (document.querySelector(sel)) return true;
      }
      const text = document.body?.innerText || '';
      if (/\bRoute options\b/i.test(text)) return true;
      return false;
    } catch (err) {
      return false;
    }
  };

  const hasErrorSignals = () => {
    try {
      const text = (document.body?.innerText || '').toLowerCase();
      const phrases = [
        'we could not calculate directions',
        'directions are not available',
        'route cannot be modified further',
        'something went wrong',
        'no route found',
        'there was an error',
      ];
      return phrases.some((p) => text.includes(p));
    } catch (err) {
      return false;
    }
  };

  const start = () => {
    const interval = setInterval(() => {
      if (done) {
        clearInterval(interval);
        return;
      }
      if (hasErrorSignals()) {
        clearInterval(interval);
        sendStatus('error');
        return;
      }
      if (hasSuccessSignals()) {
        clearInterval(interval);
        sendStatus('ok');
        return;
      }
    }, INTERVAL_MS);

    setTimeout(() => {
      if (done) return;
      clearInterval(interval);
      sendStatus('timeout');
    }, MAX_MS);
  };

  try {
    if (document && document.body) {
      start();
    } else {
      document.addEventListener('DOMContentLoaded', start, { once: true });
    }
  } catch (err) {
    sendStatus('error');
  }
})();
