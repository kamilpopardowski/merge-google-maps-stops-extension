<script lang="ts" src="./RouteCard.ts"></script>

<template>
  <div class="route">
    <div class="route-header">
      <div class="route-title">
        <input :checked="route.selected" type="checkbox" :aria-label="`select tab ${route.title}`" @change="onToggle" />
        <div>
          <div class="route-name">{{ route.title || 'Google Maps' }}</div>
          <div class="route-url" :title="route.url">{{ route.url }}</div>
        </div>
      </div>
      <div class="route-controls">
        <button class="icon-btn" :disabled="index === 0" @click="emitMove('up')">↑</button>
        <button class="icon-btn" :disabled="index === total - 1" @click="emitMove('down')">↓</button>
      </div>
    </div>
    <ul class="stops">
      <li v-for="(stop, sIdx) in route.stopsList" :key="`${route.tabId}-${sIdx}`">
        <span class="stop-chip">{{ sIdx + 1 }}</span>
        <span class="stop-name">{{ stop }}</span>
      </li>
    </ul>
  </div>
  <div class="separator"></div>
</template>

<style scoped>
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

.separator {
  height: 2px;
}
</style>
