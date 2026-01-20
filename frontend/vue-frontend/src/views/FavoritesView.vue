<template>
  <v-main class="bg-grey-lighten-4 fill-height">
    <v-container class="py-10">
      <h1 class="text-h4 font-weight-bold mb-6 text-left">
        <span style=" font-weight: bold;" class="accent">Favorites</span>
        <span class="ml-2 secondary font-weight-medium">Guides</span>
      </h1>

      <!-- Loading State -->
      <div v-if="loading" class="d-flex justify-center mt-10">
        <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
      </div>

      <!-- Empty State -->
      <div v-else-if="favorites.length === 0" class="text-center mt-10">
        <v-icon icon="mdi-heart-broken" size="100" color="grey-lighten-1" class="mb-4"></v-icon>
        <h2 class="text-h5 text-grey-darken-1">No favorites yet</h2>
        <p class="text-body-1 text-grey-darken-1 mt-2">
          Explore our guides and heart the ones you love!
        </p>
        <v-btn to="/" color="primary" class="mt-6" size="large" rounded="pill">
          Browse Guides
        </v-btn>
      </div>

      <!-- Favorites Grid -->
      <v-row v-else>
        <v-col
          v-for="guide in favorites"
          :key="guide.guide_id"
          cols="12"
          sm="6"
          md="4"
          lg="3"
        >
          <GuideCard :guide="guide" class="mx-auto" />
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import GuideCard from '@/components/GuideCard.vue'

const favorites = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return;

    const res = await axios.get('http://localhost:3000/guides/favorites', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    favorites.value = res.data;
  } catch (err) {
    console.error("Error fetching favorites:", err);
  } finally {
    loading.value = false;
  }
})
</script>
