<script setup lang="ts">
import RouteCard from './RouteCard.vue';
import type { RouteTab } from '../types';

defineProps<{
  routes: RouteTab[];
}>();

const emit = defineEmits<{
  (e: 'move', tabId: number, direction: 'up' | 'down'): void;
  (e: 'toggle', tabId: number, selected: boolean): void;
}>();
</script>

<template>
  <div class="routes" v-if="routes.length">
    <RouteCard
      v-for="(route, idx) in routes"
      :key="route.tabId"
      :route="route"
      :index="idx"
      :total="routes.length"
      @move="(id, dir) => emit('move', id, dir)"
      @toggle="(id, selected) => emit('toggle', id, selected)"
    />
  </div>
  <div v-else class="empty">No Google Maps directions tabs detected.</div>
</template>

<style scoped>
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

.empty {
  padding: 12px;
  background: #fff7ed;
  border: 1px solid #fed7aa;
  color: #9a3412;
  border-radius: 10px;
  font-size: 13px;
}
</style>
