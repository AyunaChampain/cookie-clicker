<script setup>
import { useStore } from 'vuex'
import { UPGRADES } from '../store'

const store = useStore()
const fmt = (n) => Math.floor(n).toLocaleString('fr-FR')
</script>

<template>
  <section class="card">
    <div class="bar between">
      <span>{{ store.state.user }} ({{ store.state.role }})</span>
      <span class="bar">
        <button class="alt" @click="store.dispatch('saveGame')">Sauvegarder</button>
        <button class="alt" @click="store.dispatch('loadGame')">Charger</button>
        <button class="alt" @click="store.dispatch('logout')">Deconnexion</button>
      </span>
    </div>

    <p class="center big">{{ fmt(store.state.cookies) }} cookies</p>
    <button class="cookie" @click="store.dispatch('click')">Cliquer</button>

    <!-- Statistiques : getters -->
    <p class="center">
      Production : {{ fmt(store.getters.perSecond) }} /s |
      Par clic : {{ fmt(store.getters.clickPower) }} |
      Multiplicateur : x{{ store.getters.factor }} |
      Total recolte : {{ fmt(store.state.total) }}
    </p>

    <p v-if="store.state.challenge" class="center">
      Defi contre {{ store.state.challenge.name }} :
      {{ fmt(store.state.total) }} / {{ fmt(store.state.challenge.target) }}
      <b v-if="store.getters.challengeWon"> - Defi gagne !</b>
    </p>
  </section>

  <section class="card">
    <h2>Ameliorations</h2>
    <div v-for="u in UPGRADES" :key="u.id" class="row">
      <span>{{ u.name }} (niveau {{ store.state.levels[u.id] }}) : +{{ u.cps }}/s</span>
      <button
        :disabled="!store.getters.unlocked(u.id) || store.state.cookies < store.getters.cost(u.id)"
        @click="store.dispatch('buy', u.id)"
      >
        {{ store.getters.unlocked(u.id) ? fmt(store.getters.cost(u.id)) + ' cookies' : 'Verrouille (achetez le precedent)' }}
      </button>
    </div>
    <div class="row">
      <span>Multiplicateur x2 (niveau {{ store.state.multiplier }}) : double clic et production</span>
      <button :disabled="store.state.cookies < store.getters.multiplierCost" @click="store.dispatch('buyMultiplier')">
        {{ fmt(store.getters.multiplierCost) }} cookies
      </button>
    </div>
  </section>
</template>

<style scoped>
.big { font-size: 2rem; font-weight: 700; margin: 8px 0; }
.cookie {
  display: block; margin: 12px auto; width: 150px; height: 150px; border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #d9a066, #8a4b1a);
  font-size: 1.2rem; font-weight: 700; box-shadow: 0 4px 10px rgba(0, 0, 0, .25); user-select: none;
}
.cookie:active { transform: scale(.94); }
</style>
