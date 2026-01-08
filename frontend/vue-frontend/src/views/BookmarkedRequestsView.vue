<template>
  <v-main class="bg-grey-lighten-4 fill-height">
    <v-container class="py-10">
      <h1 class="text-h4 font-weight-bold mb-6 text-left">
        <span style="font-weight: bold;" class="accent">Bookmarked</span>
        <span class="ml-2 secondary font-weight-medium">Trips</span>
      </h1>

      <!-- Loading State -->
      <div v-if="loading" class="d-flex justify-center mt-10">
        <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
      </div>

      <!-- Empty State -->
      <div v-else-if="bookmarks.length === 0" class="text-center mt-10">
        <v-icon icon="mdi-bookmark-off-outline" size="100" color="grey-lighten-1" class="mb-4"></v-icon>
        <h2 class="text-h5 text-grey-darken-1">No bookmarks yet</h2>
        <p class="text-body-1 text-grey-darken-1 mt-2">
          Save interesting requests to view them later!
        </p>
        <v-btn to="/" color="primary" class="mt-6" size="large" rounded="pill">
          Browse Requests
        </v-btn>
      </div>

      <!-- Bookmarks Grid -->
      <v-row v-else>
        <v-col
          v-for="request in bookmarks"
          :key="request.rfg_id"
          cols="12"
          sm="6"
          md="4"
          lg="3"
        >
          <TravellerCard :request="request" class="mx-auto" />
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import TravellerCard from '@/components/TravellerCard.vue'

const bookmarks = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return;

    const res = await fetch('http://localhost:3000/api/guide-bookmarks/', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (res.ok) {
      bookmarks.value = await res.json();
    } else {
      console.error("Failed to fetch bookmarks");
    }
  } catch (err) {
    console.error("Error fetching bookmarks:", err);
  } finally {
    loading.value = false;
  }
})
</script>

