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
            v-for="(item, index) in displayItems"
            :key="index"
            cols="12"
            sm="6"
            md="4"
            class="mb-10"
          >
            <component
              :is="cards[nav.cardType]"
              class="mx-auto"
              v-bind="nav.cardType === 'guide' ? { guide: item } : {}"
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
  import { ref, onMounted, onUnmounted, watch, computed } from 'vue'

  const nav = useNavStore()

  const cards = {
    guide: GuideCard,
    traveller: TravellerCard
  }

  const emit = defineEmits(['scroll-change'])
  const isScrolled = ref(false)
  const publicGuides = ref([])

  function handleScroll() {
    isScrolled.value = window.scrollY > 20
  }

  const displayItems = computed(() => {
    if (nav.cardType === 'guide') {
      return publicGuides.value
    } else {
      return [1, 2, 3, 4, 5, 6] // Dummy data for travellers
    }
  })

  watch(isScrolled, val => emit('scroll-change', val))
  
  onMounted(async () => {
    window.addEventListener('scroll', handleScroll)
    try {
      const res = await fetch('http://localhost:3000/guides/public')
      if (res.ok) {
        publicGuides.value = await res.json()
      }
    } catch (e) {
      console.error('Failed to fetch guides:', e)
    }
  })
  
  onUnmounted(() => window.removeEventListener('scroll', handleScroll))
</script>


<style scoped>

</style>
