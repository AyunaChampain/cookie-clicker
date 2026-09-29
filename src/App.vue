<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import LoginForm from './components/LoginForm.vue'
import GameView from './components/GameView.vue'
import Leaderboard from './components/Leaderboard.vue'

const store = useStore()
const connected = computed(() => !!store.state.user)
</script>

<template>
  <main>
    <h1>Cookie Clicker</h1>
    <LoginForm v-if="!connected" />
    <template v-else>
      <GameView />
      <Leaderboard />
    </template>
  </main>
</template>

<style>
body { margin: 0; padding: 12px; background: #faf5ee; color: #3b2a1a; font-family: system-ui, sans-serif; }
main { max-width: 720px; margin: auto; display: grid; gap: 12px; }
h1 { font-size: 1.5rem; margin: 0; }
h2 { font-size: 1.05rem; margin: 0 0 8px; }
.card { background: #fff; border: 1px solid #e5d8c8; border-radius: 12px; padding: 14px; }
.bar { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
.between { justify-content: space-between; }
.row { display: flex; justify-content: space-between; align-items: center; gap: 8px; padding: 6px 0; border-bottom: 1px solid #e5d8c8; }
.row:last-child { border: 0; }
button, input { font: inherit; padding: 8px 12px; border-radius: 8px; border: 1px solid #e5d8c8; }
button { background: #b8681f; color: #fff; border: 0; cursor: pointer; }
button:disabled { opacity: .4; cursor: not-allowed; }
button.alt { background: transparent; color: #3b2a1a; border: 1px solid #e5d8c8; }
.error { color: #c0392b; min-height: 1.2em; }
.center { text-align: center; }
</style>
