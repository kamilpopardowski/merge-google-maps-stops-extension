<script lang="ts" src="./App.ts"></script>

<template>
  <main class="popup">
    <section class="panel">
      <header class="header">
        <div class="heading">
          <h1>Merge and reorder stops</h1>
          <p>Pick which Google Maps tabs to combine. Reorder if needed, then merge.</p>
        </div>
        <div class="actions">
          <button class="ghost" :disabled="isLoading" @click="loadTabs">
            {{ isLoading ? 'Loading...' : 'Reload tabs' }}
          </button>
          <button class="ghost" @click="toggleAll(true)">Select all</button>
          <button class="ghost" @click="toggleAll(false)">Deselect all</button>
        </div>
      </header>

      <div class="routes" v-if="routes.length">
        <div v-for="(route, idx) in routes" :key="route.tabId" class="route">
          <div class="route-header">
            <div class="route-title">
              <input v-model="route.selected" type="checkbox" :aria-label="`select tab ${route.title}`" />
              <div>
                <div class="route-name">{{ route.title || 'Google Maps' }}</div>
                <div class="route-url" :title="route.url">{{ route.url }}</div>
              </div>
            </div>
            <div class="route-controls">
              <button class="icon-btn" :disabled="idx === 0" @click="moveRoute(route.tabId, 'up')">↑</button>
              <button class="icon-btn" :disabled="idx === routes.length - 1" @click="moveRoute(route.tabId, 'down')">↓</button>
            </div>
          </div>
          <ul class="stops">
            <li v-for="(stop, sIdx) in route.stopsList" :key="`${route.tabId}-${sIdx}`">
              <span class="stop-chip">{{ sIdx + 1 }}</span>
              <span class="stop-name">{{ stop }}</span>
            </li>
          </ul>
        </div>
      </div>

      <div v-else class="empty">No Google Maps directions tabs detected.</div>

      <button class="primary" :disabled="isMerging" @click="mergeTabs">
        <span v-if="isMerging">Merging…</span>
        <span v-else>Merge selected tabs</span>
      </button>

      <p v-if="status" class="status" :class="statusTone">{{ status }}</p>
    </section>
  </main>
</template>

<style scoped>
.popup {
  min-width: 480px;
  max-width: 520px;
  padding: 16px;
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
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.heading {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.header h1 {
  margin: 4px 0 4px;
  font-size: 22px;
  letter-spacing: -0.02em;
}

.header p {
  margin: 0;
  color: #4b5563;
  font-size: 14px;
  line-height: 1.5;
}

.actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 8px;
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

.ghost {
  background: #eef2ff;
  color: #1d4ed8;
  border: none;
  border-radius: 8px;
  padding: 8px 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.1s ease;
}

.ghost:hover:not(:disabled) {
  background: #e0e7ff;
}

.ghost:disabled {
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

.routes {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 420px;
  overflow: auto;
  padding: 4px;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
}

.route {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.route-header {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: flex-start;
}

.route-title {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.route-name {
  font-weight: 700;
  font-size: 14px;
}

.route-url {
  font-size: 12px;
  color: #6b7280;
  max-width: 320px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.route-controls {
  display: flex;
  gap: 6px;
}

.icon-btn {
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 4px 8px;
  cursor: pointer;
}

.icon-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.stops {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 4px;
}

.stops li {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #1f2937;
}

.stop-chip {
  background: #e0f2fe;
  color: #0369a1;
  border-radius: 6px;
  padding: 2px 6px;
  font-weight: 700;
  font-size: 12px;
  min-width: 22px;
  text-align: center;
}

.stop-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.empty {
  padding: 12px;
  background: #fff7ed;
  border: 1px solid #fed7aa;
  color: #9a3412;
  border-radius: 10px;
  font-size: 13px;
}
</style>
