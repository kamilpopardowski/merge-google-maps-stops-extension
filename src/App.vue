<script setup lang="ts">
import { ref } from 'vue';

type DirSegment = {
  origin: string;
  stops: string;
};

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
    <section class="panel">
      <header class="header">
        <span class="pill">Route booster</span>
        <h1>Merge all Maps stops</h1>
        <p>Stop juggling tabs—combine every open Google Maps directions tab into one route.</p>
      </header>

      <ul class="steps">
        <li>Open your Google Maps directions tabs in the order you want.</li>
        <li>Keep them in the same window.</li>
        <li>Hit merge and we’ll open a single combined route.</li>
      </ul>

      <button class="primary" :disabled="isMerging" @click="mergeTabs">
        <span v-if="isMerging">Merging…</span>
        <span v-else>Merge Google Maps tabs</span>
      </button>

      <p v-if="status" class="status" :class="statusTone">{{ status }}</p>
    </section>
  </main>
</template>

<style scoped>
.popup {
  min-width: 400px;
  max-width: 480px;
  padding: 18px;
  display: flex;
  justify-content: center;
  background: radial-gradient(circle at 20% 20%, #f0f4ff 0, transparent 35%),
    radial-gradient(circle at 80% 0%, #e8f7ff 0, transparent 30%),
    #f7f9fc;
}

.panel {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 18px 45px rgba(17, 24, 39, 0.12);
  padding: 18px 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.header h1 {
  margin: 6px 0 6px;
  font-size: 22px;
  letter-spacing: -0.02em;
}

.header p {
  margin: 0;
  color: #4b5563;
  font-size: 14px;
  line-height: 1.5;
}

.pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(120deg, #ecf2ff, #e0f2fe);
  color: #1d4ed8;
  border-radius: 999px;
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.steps {
  margin: 4px 0 0;
  padding-left: 18px;
  color: #374151;
  font-size: 13px;
  line-height: 1.5;
  display: grid;
  gap: 6px;
}

.primary {
  background: #1a73e8;
  color: #ffffff;
  border: none;
  border-radius: 10px;
  padding: 12px;
  font-size: 15px;
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
  border-radius: 10px;
  padding: 10px;
  font-size: 13px;
}

.status.info {
  color: #0f5132;
  background: #d1e7dd;
  border: 1px solid #badbcc;
}

.status.warn {
  color: #7c2d12;
  background: #fef3c7;
  border: 1px solid #fcd34d;
}
</style>
