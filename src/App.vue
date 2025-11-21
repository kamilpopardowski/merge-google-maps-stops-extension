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

<script lang="ts" src="./App.ts"></script>

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
