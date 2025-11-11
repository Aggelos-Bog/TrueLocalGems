<template>

    <HeroSection />

    <!-- MAIN SECTION (rest of the page) -->
    <v-main class="py-16">
      
      <v-container>
        <h2 class="text-h5 text-md-h4 font-weight-bold mb-6 text-center">
          Discover unique experiences
        </h2>
        <p class="text-body-1 text-center mb-10">
          Explore tours, activities, and hidden gems guided by locals around the world.
        </p>

        <v-row justify="center">
          <v-col cols="12" md="4" class="text-center">
            <v-card class="pa-6" elevation="3" rounded="xl">
              <v-icon color="lime-darken-2" size="48">mdi-map-marker</v-icon>
              <h3 class="text-h6 mt-3 mb-2">Find local guides</h3>
              <p>Search verified guides offering authentic experiences in your next destination.</p>
            </v-card>
          </v-col>

          <v-col cols="12" md="4" class="text-center">
            <v-card class="pa-6" elevation="3" rounded="xl">
              <v-icon color="lime-darken-2" size="48">mdi-earth</v-icon>
              <h3 class="text-h6 mt-3 mb-2">Discover destinations</h3>
              <p>Explore unique cultures and places through the eyes of people who live there.</p>
            </v-card>
          </v-col>

          <v-col cols="12" md="4" class="text-center">
            <v-card class="pa-6" elevation="3" rounded="xl">
              <v-icon color="lime-darken-2" size="48">mdi-account-group</v-icon>
              <h3 class="text-h6 mt-3 mb-2">Join the community</h3>
              <p>
                Become part of a growing community of travelers and guides who share experiences.
              </p>
            </v-card>
          </v-col>
        </v-row>
        <v-row justify="center">
          <v-col cols="12" md="4" class="text-center">
            <v-card class="pa-6" elevation="3" rounded="xl">
              <v-icon color="lime-darken-2" size="48">mdi-map-marker</v-icon>
              <h3 class="text-h6 mt-3 mb-2">Find local guides</h3>
              <p>Search verified guides offering authentic experiences in your next destination.</p>
            </v-card>
          </v-col>

          <v-col cols="12" md="4" class="text-center">
            <v-card class="pa-6" elevation="3" rounded="xl">
              <v-icon color="lime-darken-2" size="48">mdi-earth</v-icon>
              <h3 class="text-h6 mt-3 mb-2">Discover destinations</h3>
              <p>Explore unique cultures and places through the eyes of people who live there.</p>
            </v-card>
          </v-col>

          <v-col cols="12" md="4" class="text-center">
            <v-card class="pa-6" elevation="3" rounded="xl">
              <v-icon color="lime-darken-2" size="48">mdi-account-group</v-icon>
              <h3 class="text-h6 mt-3 mb-2">Join the community</h3>
              <p>
                Become part of a growing community of travelers and guides who share experiences.
              </p>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
</template>


<script setup>
  import HeroSection from '@/components/HeroSection.vue'
  import { ref, onMounted, onUnmounted, watch } from 'vue'

  const isScrolled = ref(false)

  function handleScroll() {
    isScrolled.value = window.scrollY > 20
  }

  // when scroll changes, notify parent
  watch(isScrolled, (val) => {
    emit('scroll-change', val)
  })

  onMounted(() => {
    window.addEventListener('scroll', handleScroll)
  })
  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
  })

  const emit = defineEmits(['scroll-change'])
</script>

<style scoped>

</style>
