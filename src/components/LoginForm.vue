<script setup>
import { ref } from 'vue'
import { useStore } from 'vuex'

const store = useStore()
const name = ref('')
const pw = ref('')
const error = ref('')

async function submit(action) {
  error.value = await store.dispatch(action, { name: name.value.trim(), pw: pw.value })
}
</script>

<template>
  <section class="card">
    <h2>Connexion</h2>
    <div class="bar">
      <input v-model="name" placeholder="Pseudo" maxlength="15" />
      <input v-model="pw" type="password" placeholder="Mot de passe" />
      <button @click="submit('login')">Connexion</button>
      <button class="alt" @click="submit('register')">Creer un compte</button>
    </div>
    <p class="error">{{ error }}</p>
    <small>Compte admin de demonstration : admin / admin</small>
  </section>
</template>
