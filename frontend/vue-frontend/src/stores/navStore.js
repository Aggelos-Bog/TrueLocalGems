// src/stores/navStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useNavStore = defineStore('nav', () => {
  // 👤 current role: guest | traveller | guide
  const role = ref('guest')

  // 🧩 Link sets for each role
  const linkSets = {
    guest: {
      left: [],
      right: [],
      utility: [
        { label: 'Register', to: '/register' },
        { label: 'Login', to: '/login', color: 'lime-darken-2', outlined: true },
      ],
    },

    traveller: {
      left: [
        { label: 'Create a Trip', to: '/create-trip' },
        { label: 'Favorite Guides', to: '/favorites' },
      ],
      right: [
        { label: 'Explore', to: '/explore' },
        { label: 'Guides', to: '/guides' },
      ],
      utility: [
        { label: 'Chat', to: '/chat' },
        { label: 'My Trips', to: '/my-trips' },
        { label: 'Logout', outlined: true, color: 'lime-darken-2' },
      ],
    },

    guide: {
      left: [
        { label: 'My Tours', to: '/guide/tours' },
        { label: 'Bookings', to: '/guide/bookings' },
      ],
      right: [
        { label: 'Explore', to: '/explore' },
        { label: 'Blog', to: '/blog' },
      ],
      utility: [
        { label: 'Messages', to: '/messages' },
        { label: 'Profile', to: '/profile' },
        { label: 'Logout', to: '/logout', outlined: true, color: 'lime-darken-2' },
      ],
    },
  }

  // 📦 computed links for current role
  const leftLinks = computed(() => linkSets[role.value].left)
  const rightLinks = computed(() => linkSets[role.value].right)
  const utilityLinks = computed(() => linkSets[role.value].utility)

  // 🔁 change role manually
  function setRole(newRole) {
    if (linkSets[newRole]) {
      role.value = newRole
    } else {
      console.warn(`Unknown role: ${newRole}`)
    }
  }


  // 🔐 logout function
  function logout() {
    role.value = "guest";
    localStorage.removeItem("token");
  }

  return {
    role,
    leftLinks,
    rightLinks,
    utilityLinks,
    logout,
    setRole,
  }
})
