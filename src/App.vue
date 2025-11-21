<script setup lang="ts">
import { ref } from 'vue';

type DirSegment = {
  origin: string;
  stops: string;
};

const status = ref('');
const isMerging = ref(false);

const mergeTabs = async () => {
  status.value = '';
  isMerging.value = true;

  try {
    const tabs = await chrome.tabs.query({ currentWindow: true });
    const sortedTabs = [...tabs].sort((a, b) => (a.index ?? 0) - (b.index ?? 0));

    const segments = sortedTabs
      .map((tab) => (tab.url ? parseDirFromUrl(tab.url) : null))
      .filter(Boolean) as DirSegment[];

    if (!segments.length) {
      status.value = 'No Google Maps directions tabs found in this window.';
      return;
    }

    const mergedStops = segments.map((segment) => segment.stops).join('/');
    const mergedUrl = `${segments[0].origin}/maps/dir/${mergedStops}`;

    await chrome.tabs.create({ url: mergedUrl });
    status.value = 'Merged route opened in a new tab.';
  } catch (error) {
    console.error('Failed to merge tabs', error);
    status.value = 'Could not merge tabs. Please try again.';
  } finally {
    isMerging.value = false;
  }
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
</script>

<template>
  <main class="popup">
    <header class="header">
      <h1>Merge Maps Stops</h1>
      <p>Collects Google Maps directions tabs in this window and opens one combined route.</p>
    </header>

    <button class="primary" :disabled="isMerging" @click="mergeTabs">
      <span v-if="isMerging">Merging...</span>
      <span v-else>Merge Google Maps tabs</span>
    </button>

    <p v-if="status" class="status">{{ status }}</p>
  </main>
</template>

<style scoped>
.popup {
  max-width: 360px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.header h1 {
  margin: 0 0 4px;
  font-size: 20px;
}

.header p {
  margin: 0;
  color: #4b5563;
  font-size: 14px;
  line-height: 1.4;
}

.primary {
  background: #1a73e8;
  color: #ffffff;
  border: none;
  border-radius: 10px;
  padding: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.1s ease;
}

.primary:hover:not(:disabled) {
  background: #155fc7;
}

.primary:active:not(:disabled) {
  transform: translateY(1px);
}

.primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.status {
  margin: 0;
  color: #0f5132;
  background: #d1e7dd;
  border: 1px solid #badbcc;
  border-radius: 8px;
  padding: 10px;
  font-size: 13px;
}
</style>
