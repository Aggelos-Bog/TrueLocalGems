// src/stores/navStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { jwtDecode  } from "jwt-decode"


export const useNavStore = defineStore('nav', () => {
  // 👤 current role: guest | traveller | guide
  const role = ref('guest')
  const userId = ref(null)

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
        { label: 'My Trips', to: '/my-trips' },
      ],
      right: [
        { label: 'My Trips', to: '/MyTrips' },
        { label: 'Favorite Guides', to: '/favorites' },
      ],
      utility: [
        { label: 'Chat', to: '/chat' },
        { label: 'Logout', outlined: true, color: 'lime-darken-2' },
      ],
    },

    guide: {
      left: [
        { label: 'Book Mark', to: '/guide/bookings' },
      ],
      right: [
        { label: 'My Tours', to: '/guide/tours' },
      ],
      utility: [
        { label: 'Chat', to: '/Chat' },
        { label: "Profile", action: "go-profile" },
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

  function loadFromToken() {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const decoded = jwtDecode(token);
      console.log("Decoded token →", decoded);
      userId.value = decoded.id;
      role.value = decoded.role;
    } catch (err) {
      console.error("Invalid JWT", err);
      logout();
    }
  }

  // 🔐 logout function
  function logout() {
    role.value = "guest";
    userId.value = null;     // 🔥 IMPORTANT
    localStorage.removeItem("token");
  }


  return {
    role,
    userId,
    leftLinks,
    rightLinks,
    utilityLinks,
    loadFromToken,
    logout,
    setRole,
  }
})
