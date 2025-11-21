import { defineComponent, ref } from 'vue';

type DirSegment = {
  origin: string;
  stops: string;
};

const parseDirFromUrl = (url: string): DirSegment | null => {
  try {
    const parsed = new URL(url);
    if (!parsed.pathname.startsWith('/maps/dir/')) return null;

    const origin = parsed.origin;
    let stopsPart = parsed.pathname.replace('/maps/dir/', '');

    const atIndex = stopsPart.indexOf('/@');
    stopsPart = atIndex >= 0 ? stopsPart.slice(0, atIndex) : stopsPart;
    stopsPart = stopsPart.replace(/\/$/, '');

    if (!stopsPart) return null;

    return { origin, stops: stopsPart };
  } catch {
    return null;
  }
};

export default defineComponent({
  setup() {
    const status = ref('');
    const statusTone = ref<'idle' | 'info' | 'warn'>('idle');
    const isMerging = ref(false);
    const isLoading = ref(false);
    const routes = ref<
      Array<{
        tabId: number;
        title: string;
        url: string;
        origin: string;
        stopsPart: string;
        stopsList: string[];
        selected: boolean;
        order: number;
      }>
    >([]);

    const decodeStops = (stopsPart: string) =>
      stopsPart
        .split('/')
        .map((part) => decodeURIComponent(part || ''))
        .filter(Boolean);

    const loadTabs = async () => {
      isLoading.value = true;
      status.value = '';
      statusTone.value = 'idle';
      try {
        const tabs = await chrome.tabs.query({ currentWindow: true });
        const sorted = [...tabs].sort((a, b) => (a.index ?? 0) - (b.index ?? 0));

        const parsed = sorted
          .map((tab, idx) => {
            if (!tab.url) return null;
            const parsedDir = parseDirFromUrl(tab.url);
            if (!parsedDir) return null;
            return {
              tabId: tab.id ?? idx,
              title: tab.title ?? 'Google Maps',
              url: tab.url,
              origin: parsedDir.origin,
              stopsPart: parsedDir.stops,
              stopsList: decodeStops(parsedDir.stops),
              selected: true,
              order: idx,
            };
          })
          .filter(Boolean);

        routes.value = parsed as typeof routes.value;
        if (!routes.value.length) {
          status.value = 'No Google Maps directions tabs found in this window.';
          statusTone.value = 'warn';
        }
      } catch (error) {
        console.error('Failed to load tabs', error);
        status.value = 'Could not load tabs. Please try again.';
        statusTone.value = 'warn';
      } finally {
        isLoading.value = false;
      }
    };

    const mergeTabs = async () => {
      status.value = '';
      statusTone.value = 'info';
      isMerging.value = true;

      try {
        const selectedRoutes = routes.value
          .filter((route) => route.selected)
          .sort((a, b) => a.order - b.order);

        if (!selectedRoutes.length) {
          status.value = 'Select at least one Maps tab to merge.';
          statusTone.value = 'warn';
          return;
        }

        const mergedStops = selectedRoutes.map((route) => route.stopsPart).join('/');
        const mergedUrl = `${selectedRoutes[0].origin}/maps/dir/${mergedStops}`;

        await chrome.tabs.create({ url: mergedUrl });
        status.value = 'Merged route opened in a new tab.';
        statusTone.value = 'info';
      } catch (error) {
        console.error('Failed to merge tabs', error);
        status.value = 'Could not merge tabs. Please try again.';
        statusTone.value = 'warn';
      } finally {
        isMerging.value = false;
      }
    };

    const moveRoute = (tabId: number, direction: 'up' | 'down') => {
      const currentIndex = routes.value.findIndex((r) => r.tabId === tabId);
      if (currentIndex === -1) return;
      const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      if (swapIndex < 0 || swapIndex >= routes.value.length) return;
      const newRoutes = [...routes.value];
      const tmpOrder = newRoutes[currentIndex].order;
      newRoutes[currentIndex].order = newRoutes[swapIndex].order;
      newRoutes[swapIndex].order = tmpOrder;
      routes.value = newRoutes.sort((a, b) => a.order - b.order);
    };

    const toggleAll = (checked: boolean) => {
      routes.value = routes.value.map((r) => ({ ...r, selected: checked }));
    };

    loadTabs();

    return {
      status,
      statusTone,
      isMerging,
      isLoading,
      routes,
      loadTabs,
      mergeTabs,
      moveRoute,
      toggleAll,
    };
  },
});
