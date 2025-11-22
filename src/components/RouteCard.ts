import { defineComponent } from 'vue';
import type { RouteTab } from '../types';

export default defineComponent({
  name: 'RouteCard',
  props: {
    route: {
      type: Object as () => RouteTab,
      required: true,
    },
    index: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
  },
  emits: ['move', 'toggle'],
  methods: {
    onToggle(event: Event) {
      const checked = (event.target as HTMLInputElement).checked;
      this.$emit('toggle', this.route.tabId, checked);
    },
    emitMove(direction: 'up' | 'down') {
      this.$emit('move', this.route.tabId, direction);
    },
  },
});
