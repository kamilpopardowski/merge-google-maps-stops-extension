import { defineComponent } from 'vue';
import RouteCard from './RouteCard.vue';
import type { RouteTab } from '../types';

export default defineComponent({
  name: 'RouteList',
  components: { RouteCard },
  props: {
    routes: {
      type: Array as () => RouteTab[],
      required: true,
    },
  },
  emits: ['move', 'toggle'],
  methods: {
    onMove(tabId: number, direction: 'up' | 'down') {
      this.$emit('move', tabId, direction);
    },
    onToggle(tabId: number, selected: boolean) {
      this.$emit('toggle', tabId, selected);
    },
  },
});
