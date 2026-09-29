<script setup>
import { useStore } from 'vuex'

const store = useStore()
const fmt = (n) => Math.floor(n).toLocaleString('fr-FR')

function editScore(p) {
  const value = parseInt(prompt('Nouveau score pour ' + p.name + ' :', p.score), 10)
  if (!isNaN(value) && value >= 0) store.dispatch('adminSetScore', { name: p.name, value })
}
function resetAll() {
  if (confirm('Reinitialiser le jeu pour tous les joueurs ?')) store.dispatch('adminReset')
}
</script>

<template>
  <section class="card">
    <h2>Classement</h2>
    <div v-if="store.getters.isAdmin" style="margin-bottom: 8px">
      <button @click="resetAll">Reinitialiser le jeu</button>
    </div>
    <div v-for="(p, i) in store.getters.leaderboard" :key="p.name" class="row">
      <span>{{ i + 1 }}. {{ p.name }} <small>({{ p.role }})</small></span>
      <span class="bar">
        <b>{{ fmt(p.score) }}</b> cookies
        <button v-if="p.name !== store.state.user" @click="store.dispatch('challenge', p.name)">Defier</button>
        <button v-if="store.getters.isAdmin" class="alt" @click="editScore(p)">Modifier</button>
      </span>
    </div>
  </section>
</template>
