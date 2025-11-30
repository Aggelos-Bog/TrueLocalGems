<template>
    <!-- HERO SECTION (70% height) -->
    <v-sheet
      color="primary"
      height="65vh"
      elevation="10"
      class="d-flex flex-column align-center justify-center text-center"
    >

      <!-- Hero content -->
      <div class="d-flex align-center justify-space-evenly w-100 mt-8">
        <!-- Left text & search -->
        <div class="text-left mr-md-10">
          <h1 class="text-h5 text-md-h4 font-weight-bold mb-6 secondary">
            See the world through <br />
            a<span class="accent font-weight-bold"> local's eyes</span>
          </h1>

          <v-spacer class=""></v-spacer>

          <div class="d-flex align-center">
            <v-autocomplete
              v-model="destination"
              :items="countries"
              label="Destination Country"
              variant="solo-filled"
              rounded="pill"
              class="rounded-pill mr-2 bg-white"
              density="comfortable"
              hide-details
              clearable
            ></v-autocomplete>

            <v-btn color="lime-darken-2" class="rounded-pill" size="large">Search</v-btn>
          </div>
        </div>

        <!-- Right image -->
        <div>
          <v-row align="center" justify="center" max-height="300" width="500">
            <v-col cols="8" md="8" lg="12" class="d-none d-sm-flex justify-center">
              <v-img
                :src="heroImage"
                alt="Hero image"
                max-height="60%"
                width="300"
                contain
                class="rounded-lg shadow-lg hero-height"
              />
            </v-col>
          </v-row>
        </div>
      </div>
    </v-sheet>


</template>

<script setup>
import heroImage from '@/assets/images/home-page.png'
import { ref, onMounted } from 'vue'

const destination = ref()
const countries = ref([])

onMounted(async () => {
  try {
    const res = await fetch(
      'https://restcountries.com/v3.1/region/europe?fields=name'
    )
    const data = await res.json()

    countries.value = data
      .map(c => c.name.common)
      .sort()
  } catch (error) {
    console.error('Error fetching countries:', error)
  }
})
</script>


<style scoped>
/* ✨ Smooth transition for shadow changes */
.transition-elevation {
  transition: box-shadow 0.3s ease;
}

@media (max-height: 800px) {
  .hero-height {
    height: 300px;
  }
}

@media (max-height: 550px) {
  .hero-height {
    display: none;
  }
}
</style>
