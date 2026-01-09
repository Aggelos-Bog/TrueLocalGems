import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/logged-out/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/logged-out/RegisterView.vue'


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
      component: () => import('../views/CreateTripView.vue'),
      meta: { forceScrolled: true }
    },
    {
      path: '/my-trips',
      name: 'my-trips',
      component: () => import('../views/MyTripsView.vue'),
      meta: { forceScrolled: true }
    },
    {
      path: '/request/:id',
      name: 'request-details',
      component: () => import('../views/TripRequestDetailsView.vue'),
      meta: { forceScrolled: true }
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { forceScrolled: true }
    },
    {
      path: "/guide/:id",
      name: "GuideProfile",
      component: () => import("@/components/GuideProfile.vue"),
      meta: { forceScrolled: true }
    },
    {
      path: '/favorites',
      name: 'favorites',
      component: () => import('../views/FavoritesView.vue'),
      meta: { forceScrolled: true }
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
      meta: { forceScrolled: true }
    },
    {
      path: '/check-email',
      name: 'check-email',
      component: () => import('../views/logged-out/CheckEmailView.vue'),
      meta: { forceScrolled: true }
    },
    {
      path: '/bookmarks',
      name: 'bookmarks',
      component: () => import('../views/BookmarkedRequestsView.vue'),
      meta: { forceScrolled: true }
    },
    {
      path: '/chat',
      name: 'chat',
      component: () => import('../views/LiveMessageView.vue'),
      meta: { forceScrolled: true }
    },
  ],
})

export default router
