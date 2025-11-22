type RouteTestStatus = 'ok' | 'error' | 'timeout';

const mapsRegex = /^https?:\/\/(www\.)?google\.[^/]+\/maps/i;

const updateBadge = async (tabId: number, url?: string) => {
  if (!url) return;
  const isMaps = mapsRegex.test(url);

  try {
    if (isMaps) {
      await chrome.action.setBadgeText({ tabId, text: 'GO!' });
      await chrome.action.setBadgeBackgroundColor({ tabId, color: '#ef4444' });
      await chrome.action.setTitle({
        tabId,
        title: 'Maps detected. Click to merge all stops.',
      });
    } else {
      await chrome.action.setBadgeText({ tabId, text: '' });
      await chrome.action.setTitle({ tabId, title: '' });
    }
  } catch (err) {
    console.error('[merge-stops] badge update failed', err);
  }
};

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' || changeInfo.url) {
    const url = changeInfo.url ?? tab.url;
    if (url) updateBadge(tabId, url);
  }
});

chrome.tabs.onActivated.addListener(({ tabId }) => {
  chrome.tabs
    .get(tabId)
    .then((tab) => {
      if (tab?.url) updateBadge(tabId, tab.url);
    })
    .catch(() => {
      /* ignore */
    });
});

chrome.tabs.query({}).then((tabs) => {
  tabs.forEach((tab) => {
    if (tab.id !== undefined && tab.url) {
      updateBadge(tab.id, tab.url);
    }
  });
});

const setErrorBadge = async () => {
  try {
    await chrome.action.setBadgeText({ text: 'ERR' });
    await chrome.action.setBadgeBackgroundColor({ color: '#dc2626' });
    await chrome.action.setTitle({ title: 'Route failed to load' });
  } catch {
    /* ignore */
  }
};

const handleTestMergedRoute = (url: string, sendResponse: (response: { status: RouteTestStatus }) => void) => {
  let testTabId: number | null = null;
  let responded = false;
  let timer: ReturnType<typeof setTimeout> | null = null;

  const cleanup = async (status: RouteTestStatus) => {
    if (status !== 'ok' && testTabId !== null) {
      try {
        await chrome.tabs.remove(testTabId);
      } catch {
        /* ignore */
      }
    }
    console.log('[merge-stops] testMergedRoute cleanup', { status, testTabId });
    sendResponse({ status });
  };

  const responseListener = (msg: any, msgSender: chrome.runtime.MessageSender) => {
    if (responded) return;
    if (!msg || typeof msg !== 'object') return;
    if (!msgSender?.tab || msgSender.tab.id !== testTabId) return;
    if (msg.type !== 'mergedRouteStatus' && msg.type !== 'testMergedRouteResult') return;

    responded = true;
    if (timer) clearTimeout(timer);
    chrome.runtime.onMessage.removeListener(responseListener);
    const status: RouteTestStatus =
      msg.status === 'ok' ? 'ok' : msg.status === 'timeout' ? 'timeout' : 'error';
    if (status !== 'ok') {
      setErrorBadge();
    }
    cleanup(status);
  };

  (async () => {
    try {
      console.log('[merge-stops] testMergedRoute open tab', url);
      const tab = await chrome.tabs.create({ url, active: true });
      testTabId = tab.id ?? null;

      chrome.runtime.onMessage.addListener(responseListener);

      timer = setTimeout(() => {
        if (responded) return;
        responded = true;
        chrome.runtime.onMessage.removeListener(responseListener);
        console.warn('[merge-stops] testMergedRoute timeout');
        cleanup('timeout');
        setErrorBadge();
      }, 30000);
    } catch (err) {
      console.error('[merge-stops] testMergedRoute failed to open tab', err);
      if (!responded) {
        responded = true;
        chrome.runtime.onMessage.removeListener(responseListener);
        cleanup('error');
        setErrorBadge();
      }
    }
  })();
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || typeof message !== 'object') return;

  if (message.type === 'openExtensionPopupHint') {
    if (chrome.action?.openPopup) {
      chrome.action.openPopup().catch(() => {});
    }
    sendResponse?.({ ok: true });
  }

  if (message.type === 'testMergedRoute' && message.url) {
    handleTestMergedRoute(String(message.url), sendResponse as any);
    return true; // keep channel open
  }
});
