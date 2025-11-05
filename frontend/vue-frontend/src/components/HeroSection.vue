<template>
    <!-- HERO SECTION (70% height) -->
    <v-sheet
      color="primary"
      height="65vh"
      elevation="10"
      class="d-flex flex-column align-center justify-center text-center"
      ref="heroSection"
    >
      <!-- 🌟 Sticky Top App Bar -->
      <!-- The elevation changes dynamically when you scroll past the hero section -->
      

        <NavBar :isScrolled="isScrolled"/>


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
            <v-text-field
              v-model="destination"
              hide-details
              variant="solo-filled"
              rounded="pill"
              placeholder="Where to next?"
              class="rounded-pill mr-2 bg-white"
              density="comfortable"
            ></v-text-field>
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
    import NavBar from '@/components/NavBar.vue'
    import heroImage from '@/assets/images/home-page.png'
    import { ref, onMounted, onUnmounted } from 'vue'

    const drawer = ref(false) // 👈 state for mobile menu
    const destination = ref('')
    // 🔄 Reactive state that tracks whether we've scrolled past the hero section
    const isScrolled = ref(false)
    // 📏 Reference to the hero section element so we can measure its height
    const heroSection = ref(null)

    // 🧩 Function that runs whenever the user scrolls
    // If the scroll position (window.scrollY) is greater than the hero’s height,
    // it means the user has scrolled past the hero — so we apply elevation.
    const handleScroll = () => {
    const heroHeight = heroSection.value?.offsetHeight || 0
    isScrolled.value = window.scrollY > heroHeight
    }

    // ⚙️ Lifecycle hooks to register/unregister the scroll event listener
    onMounted(() => {
        window.addEventListener('scroll', handleScroll)
    })
    onUnmounted(() => {
        window.removeEventListener('scroll', handleScroll)
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
