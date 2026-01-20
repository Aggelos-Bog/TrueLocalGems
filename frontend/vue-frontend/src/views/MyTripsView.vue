<template>
  <div style="height: 80px;"></div>

  <v-main class="py-16">
    <v-container>
      <h2 class="text-h4 font-weight-bold mb-12 secondary text-left text-shadow-custom">
        My <span class="accent font-weight-bold">Trip Requests</span>
      </h2>

      <div v-if="loading" class="d-flex justify-center">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
      </div>

      <div v-else-if="requests.length === 0" class="text-center text-h6 text-grey">
        You haven't created any trip requests yet.
        <div class="mt-4">
            <v-btn to="/create-trip" color="lime-darken-2" rounded="pill">Create One Now</v-btn>
        </div>
      </div>

      <v-row v-else>
        <v-col
          v-for="(req, index) in requests"
          :key="index"
          cols="12"
          sm="6"
          md="4"
          class="mb-10"
        >
          <TravellerCard
            :request="req"
            class="mx-auto"
          />
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import TravellerCard from '@/components/TravellerCard.vue';

const requests = ref([]);
const loading = ref(true);

const loadMyRequests = async () => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.get('http://localhost:3000/api/requests/my-requests', {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    
    requests.value = res.data;
  } catch (err) {
    console.error("Error loading my requests:", err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadMyRequests();
});
</script>

<style scoped>
.text-shadow-custom {
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.25);
}
</style>
