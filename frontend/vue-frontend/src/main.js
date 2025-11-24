import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'

import { useAuth } from "@/composables/useAuth";
import { useNavStore } from '@/stores/navStore.js'

const app = createApp(App)

// 1️⃣ Install plugins FIRST
app.use(createPinia())
app.use(router)
app.use(vuetify)

// 2️⃣ Only NOW you can safely use the store
const navStore = useNavStore()
navStore.loadFromToken()

// 3️⃣ Initialize your auth logic
const { initializeAuth } = useAuth()
initializeAuth()

// 4️⃣ Mount
app.mount('#app')
