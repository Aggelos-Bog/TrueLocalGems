<template>

    <HeroSection />

    <!-- MAIN SECTION (rest of the page) -->
    <v-main class="py-16">
      
      <v-container>
        <h2 class="text-h5 text-md-h4 font-weight-bold mb-12 secondary text-left">
          {{ nav.sectionTitle }}
        </h2>

        <v-row>
          <v-col
            v-for="n in 6"
            :key="n"
            cols="12"
            sm="6"
            md="4"
            class="mb-10"
          >
            <component
              :is="cards[nav.cardType]"
              class="mx-auto"
            />
          </v-col>
        </v-row>

      </v-container>
    </v-main>
</template>

<script setup>
  import HeroSection from '@/components/HeroSection.vue'
  import GuideCard from '@/components/GuideCard.vue'
  import TravellerCard from '@/components/TravellerCard.vue'
  import { useNavStore } from '@/stores/navStore'
  import { ref, onMounted, onUnmounted, watch } from 'vue'

  const nav = useNavStore()

  const cards = {
    guide: GuideCard,
    traveller: TravellerCard
  }

  const emit = defineEmits(['scroll-change'])
  const isScrolled = ref(false)

  function handleScroll() {
    isScrolled.value = window.scrollY > 20
  }

  watch(isScrolled, val => emit('scroll-change', val))
  onMounted(() => window.addEventListener('scroll', handleScroll))
  onUnmounted(() => window.removeEventListener('scroll', handleScroll))
</script>


<style scoped>

</style>
