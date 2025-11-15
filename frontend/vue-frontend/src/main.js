import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import vuetify from './plugins/vuetify'

import { useAuth } from "@/composables/useAuth";

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(vuetify)

const { initializeAuth } = useAuth();
initializeAuth(); // 🔥 Load role on startup

app.mount('#app')
