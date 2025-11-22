const mapsRegex = /^https?:\/\/(www\.)?google\.[^/]+\/maps/i;

async function updateBadge(tabId, url) {
  if (!url) return;
  const isMaps = mapsRegex.test(url);

  try {
    if (isMaps) {
      await chrome.action.setBadgeText({ tabId, text: 'GO!' });
      await chrome.action.setBadgeBackgroundColor({ tabId, color: '#ec4899' });
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
}

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

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || typeof message !== 'object') return;
  if (message.type === 'openExtensionPopupHint') {
    if (chrome.action?.openPopup) {
      chrome.action.openPopup().catch(() => {});
    }
    sendResponse?.({ ok: true });
  }

  if (message.type === 'testMergedRoute' && message.url) {
    let testTabId = null;
    let responded = false;
    let timer = null;

    const finish = async (status) => {
      if (testTabId !== null) {
        try {
          await chrome.tabs.remove(testTabId);
        } catch (err) {
          // ignore
        }
      }
      sendResponse?.({ status });
    };

    const responseListener = (msg, msgSender) => {
      if (responded) return;
      if (!msg || typeof msg !== 'object') return;
      if (!msgSender?.tab || msgSender.tab.id !== testTabId) return;
      if (msg.type !== 'mergedRouteStatus') return;

      responded = true;
      clearTimeout(timer);
      chrome.runtime.onMessage.removeListener(responseListener);
      finish(msg.status === 'ok' ? 'ok' : 'error');
    };

    (async () => {
      try {
        const tab = await chrome.tabs.create({ url: message.url, active: false });
        testTabId = tab.id ?? null;

        chrome.runtime.onMessage.addListener(responseListener);

        timer = setTimeout(() => {
          if (responded) return;
          responded = true;
          chrome.runtime.onMessage.removeListener(responseListener);
          finish('timeout');
        }, 15000);
      } catch (err) {
        if (!responded) {
          responded = true;
          chrome.runtime.onMessage.removeListener(responseListener);
          finish('error');
        }
      }
    })();

    return true; // keep channel open for async sendResponse
  }
});
