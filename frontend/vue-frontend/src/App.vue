<template>
  <v-app>
    <NavBar :isScrolled="finalScrolled" />

    <router-view v-slot="{ Component }">
      <component
        :is="Component"
        @scroll-change="isScrolled = $event"
      />
    </router-view>
  </v-app>
</template>

<script setup>
import NavBar from '@/components/NavBar.vue'
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isScrolled = ref(false)

// This computed decides the *actual* value sent to NavBar
const finalScrolled = computed(() => {
  return route.meta.forceScrolled === true
    ? true
    : isScrolled.value
})
</script>
