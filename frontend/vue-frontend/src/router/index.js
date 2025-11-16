import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/logged-out/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/logged-out/RegisterView.vue'
import GuideRegister from '../views/Guide/GuideRegister.vue'
import GuideProfile from '../views/Guide/GuideProfile.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/create-trip',
      name: 'create-trip',
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { forceScrolled: true }
    },
    {
      path: '/GuideRegister',
      name: 'GuideRegister',
      component: GuideRegister,
      meta: { forceScrolled: true }
    },
    {
      path: '/GuideProfile',
      name: 'GuideProfile',
      component: GuideProfile,
      meta: { forceScrolled: true }
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
      meta: { forceScrolled: true }
    },
  ],
})

export default router
