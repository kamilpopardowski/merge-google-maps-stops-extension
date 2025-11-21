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

    const mergeTabs = async () => {
      status.value = '';
      statusTone.value = 'info';
      isMerging.value = true;

      try {
        const tabs = await chrome.tabs.query({ currentWindow: true });
        const sortedTabs = [...tabs].sort((a, b) => (a.index ?? 0) - (b.index ?? 0));

        const segments = sortedTabs
          .map((tab) => (tab.url ? parseDirFromUrl(tab.url) : null))
          .filter(Boolean) as DirSegment[];

        if (!segments.length) {
          status.value = 'No Google Maps directions tabs found in this window.';
          statusTone.value = 'warn';
          return;
        }

        const mergedStops = segments.map((segment) => segment.stops).join('/');
        const mergedUrl = `${segments[0].origin}/maps/dir/${mergedStops}`;

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

    return {
      status,
      statusTone,
      isMerging,
      mergeTabs,
    };
  },
});
