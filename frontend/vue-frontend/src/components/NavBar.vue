<template>
  <v-app-bar
    flat
    :elevation="isScrolled ? 8 : 0"
    height="80"
    color="#ffe4cc"
    class="px-8"
  >
    <!-- Left spacer (keeps the center block centered) -->
    <v-spacer v-if="rightLinksFlag" class="d-none d-md-flex"></v-spacer>
    <v-spacer></v-spacer>

    <!-- CENTER GROUP: left links + logo + right links -->
    <div class="d-flex align-center">
      <!-- Center-Left links -->
      <div class="d-none d-md-flex align-center">
        <v-btn
          v-for="(link, i) in leftLinks"
          :key="'left-' + i"
          :to="link.to"
          :variant="link.variant || 'text'"
          :color="link.color || 'black'"
          class="mx-2"
          size="small"
        >
          {{ link.label }}
        </v-btn>
      </div>

      <!-- Logo -->
      <v-img :src="logo" alt="Logo" width="150" height="150" contain />

      <!-- Center-Right links -->
      <div class="d-none d-md-flex align-center">
        <v-btn
          v-for="(link, i) in rightLinks"
          :key="'right-' + i"
          :to="link.to"
          :variant="link.variant || 'text'"
          :color="link.color || 'black'"
          class="mx-2"
          size="small"
        >
          {{ link.label }}
        </v-btn>
      </div>
    </div>

    <!-- Right spacer -->
    <v-spacer></v-spacer>

    <!-- 🌟 Mobile Hamburger Icon -->
    <v-app-bar-nav-icon class="d-md-none" @click="drawer = !drawer" />

    <!-- Utility / user links -->
    <div class="d-none d-md-flex align-center">
      <v-btn
        v-for="(link, i) in utilityLinks"
        :key="'util-' + i"
        :to="link.to"
        :variant="link.outlined ? 'outlined' : link.variant || 'text'"
        :color="link.color || 'black'"
        class="mx-2"
        size="small"
      >
        {{ link.label }}
      </v-btn>
    </div>
  </v-app-bar>
          <v-navigation-drawer v-model="drawer" app temporary location="right" color="#ffe4cc">
            <v-list>
            <v-list-item title="Create a Trip" :to="{ name: 'create-trip' }" />
            <v-list-item title="Favorites" />
            <v-list-item title="Explore" />
            <v-list-item title="Guides" />
            <v-divider class="my-2"></v-divider>
            <v-list-item title="Chat" />
            <v-list-item title="My Trips" />
            <v-list-item title="Log-out" />
            </v-list>
        </v-navigation-drawer>
</template>

<script setup>
import logo from '@/assets/images/logo-tlg.png'
import { ref, computed } from 'vue'
import { useNavStore } from '@/stores/navStore'
import { storeToRefs } from 'pinia'

// Props from parent (still keep for scroll)
const props = defineProps({
  isScrolled: Boolean,
})

const drawer = ref(false)

// 🏪 Grab links from Pinia store
const navStore = useNavStore()
const { leftLinks, rightLinks, utilityLinks } = storeToRefs(navStore)

// ✅ Flag to check if rightLinks exist
const rightLinksFlag = computed(
  () => Array.isArray(rightLinks.value) && rightLinks.value.length > 0
)

</script>

