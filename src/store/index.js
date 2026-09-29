import { createStore } from 'vuex'

export const UPGRADES = [
  { id: 'clicker', name: 'Clicker', base: 15,   cps: 1 },
  { id: 'ouvrier', name: 'Ouvrier', base: 100,  cps: 5 },
  { id: 'equipe',  name: 'Equipe',  base: 500,  cps: 20 },
  { id: 'usine',   name: 'Usine',   base: 3000, cps: 100 }
]

const fresh = () => ({
  cookies: 0,
  total: 0,
  autoProduction: 0,
  multiplier: 0,
  levels: { clicker: 0, ouvrier: 0, equipe: 0, usine: 0 }
})


const KEY = 'cc_users'
const readUsers = () => {
  try { return JSON.parse(localStorage.getItem(KEY)) || {} } catch { return {} }
}
const writeUsers = (u) => localStorage.setItem(KEY, JSON.stringify(u))

function initialUsers() {
  const u = readUsers()
  if (!u.admin) {                       // compte admin cree au premier lancement
    u.admin = { pw: 'admin', role: 'Admin', save: fresh() }
    writeUsers(u)
  }
  return u
}

let timer = null

export default createStore({

  state: () => ({
    ...fresh(),              // cookies, total, autoProduction, multiplier, levels
    user: null,
    role: null,
    users: initialUsers(),
    challenge: null
  }),


  getters: {
    factor: (s) => 2 ** s.multiplier,
    perSecond: (s, g) => s.autoProduction * g.factor,
    clickPower: (s, g) => g.factor,
    cost: (s) => (id) => Math.ceil(UPGRADES.find((u) => u.id === id).base * 1.15 ** s.levels[id]),
    multiplierCost: (s) => 100 * 3 ** s.multiplier,
    // une amelioration se debloque quand la precedente est achetee
    unlocked: (s) => (id) => {
      const i = UPGRADES.findIndex((u) => u.id === id)
      return i === 0 || s.levels[UPGRADES[i - 1].id] > 0
    },
    isAdmin: (s) => s.role === 'Admin',
    leaderboard: (s) =>
      Object.keys(s.users)
        .map((name) => ({ name, role: s.users[name].role, score: Math.floor(s.users[name].save.total || 0) }))
        .sort((a, b) => b.score - a.score),
    challengeWon: (s) => !!s.challenge && s.total > s.challenge.target
  },

  mutations: {
    ADD_COOKIES(s, n) { s.cookies += n; s.total += n },
    BUY_UPGRADE(s, { id, cost, cps }) { s.cookies -= cost; s.levels[id]++; s.autoProduction += cps },
    BUY_MULTIPLIER(s, cost) { s.cookies -= cost; s.multiplier++ },
    SET_GAME(s, data) { Object.assign(s, fresh(), JSON.parse(JSON.stringify(data))) },
    SET_SESSION(s, { user, role }) { s.user = user; s.role = role; s.challenge = null },
    SET_USERS(s, users) { s.users = users },
    SET_CHALLENGE(s, c) { s.challenge = c }
  },


  actions: {
    click({ commit, getters }) {
      commit('ADD_COOKIES', getters.clickPower)
    },
    buy({ state, getters, commit }, id) {
      const cost = getters.cost(id)
      if (getters.unlocked(id) && state.cookies >= cost) {
        commit('BUY_UPGRADE', { id, cost, cps: UPGRADES.find((u) => u.id === id).cps })
      }
    },
    buyMultiplier({ state, getters, commit }) {
      if (state.cookies >= getters.multiplierCost) commit('BUY_MULTIPLIER', getters.multiplierCost)
    },

    startAutoProduction({ state, getters, commit }) {
      if (timer) return
      timer = setInterval(() => {
        if (state.user) commit('ADD_COOKIES', getters.perSecond)
      }, 1000)
    },

    register({ dispatch }, { name, pw }) {
      if (!/^[\w-]{2,15}$/.test(name)) return 'Pseudo : 2 a 15 caracteres (lettres, chiffres, _ -).'
      if (!pw) return 'Mot de passe requis.'
      const users = readUsers()
      if (users[name]) return 'Ce pseudo existe deja.'
      users[name] = { pw, role: 'Player', save: fresh() }
      writeUsers(users)
      return dispatch('login', { name, pw })
    },
    login({ commit }, { name, pw }) {
      const users = readUsers()
      if (!users[name] || users[name].pw !== pw) return 'Pseudo ou mot de passe incorrect.'
      commit('SET_USERS', users)
      commit('SET_SESSION', { user: name, role: users[name].role })
      commit('SET_GAME', users[name].save)
      return ''
    },
    logout({ commit }) {
      commit('SET_SESSION', { user: null, role: null })
    },
    saveGame({ state, commit }) {
      const users = readUsers()
      const { cookies, total, autoProduction, multiplier, levels } = state
      users[state.user].save = { cookies, total, autoProduction, multiplier, levels }
      writeUsers(users)
      commit('SET_USERS', users)
    },
    loadGame({ state, commit }) {
      commit('SET_GAME', readUsers()[state.user].save)
    },


    challenge({ state, commit }, name) {
      commit('SET_CHALLENGE', { name, target: Math.floor(state.users[name].save.total || 0) })
    },


    adminSetScore({ state, getters, commit }, { name, value }) {
      if (!getters.isAdmin) return
      const users = readUsers()
      users[name].save = { ...fresh(), ...users[name].save, total: value, cookies: value }
      writeUsers(users)
      commit('SET_USERS', users)
      if (name === state.user) commit('SET_GAME', users[name].save)
    },
    adminReset({ getters, commit }) {
      if (!getters.isAdmin) return
      const users = readUsers()
      Object.keys(users).forEach((k) => { users[k].save = fresh() })
      writeUsers(users)
      commit('SET_USERS', users)
      commit('SET_GAME', {})
    }
  }
})
