<template>

    <HeroSection @search="handleSearch" />

    <!-- MAIN SECTION (rest of the page) -->
    <v-main class="py-16">
      
      <v-container>
        <h2 class="text-h5 text-md-h4 font-weight-bold mb-12 secondary text-left text-shadow-custom" v-html="nav.sectionTitle">
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
              v-bind="nav.cardType === 'guide' ? { guide: item } : { request: item }"
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
  const requests = ref([])

  function handleScroll() {
    isScrolled.value = window.scrollY > 20
  }

  async function handleSearch(country) {
    if (nav.cardType === 'guide') {
      // User is searching for Guides
      if (!country) {
        loadAllGuides();
        return;
      }
      try {
        const token = localStorage.getItem("token");
        const headers = {};
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch(`http://localhost:3000/guides/search?country=${country}`, { headers });
        if (res.ok) {
          publicGuides.value = await res.json();
        } else {
          const err = await res.json();
          alert(err.error || "Search failed");
        }
      } catch (e) {
        console.error("Search error:", e);
      }
    } else {
      // User is searching for Requests (because they are a Guide)
      loadRequests(country);
    }
  }

  async function loadAllGuides() {
    try {
      const token = localStorage.getItem("token");
      const headers = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch('http://localhost:3000/guides/public', {
        headers
      })
      if (res.ok) {
        publicGuides.value = await res.json()
      }
    } catch (e) {
      console.error('Failed to fetch guides:', e)
    }
  }

  async function loadRequests(country = '') {
    try {
      const token = localStorage.getItem("token");
      const headers = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      
      let url = 'http://localhost:3000/api/requests';
      if (country) {
        url += `?country=${country}`;
      }

      const res = await fetch(url, { headers });
      if (res.ok) {
        const data = await res.json();
        requests.value = data;
      }
    } catch (e) {
      console.error('Failed to fetch requests:', e);
    }
  }

  const displayItems = computed(() => {
    if (nav.cardType === 'guide') {
      return publicGuides.value
    } else {
      return requests.value
    }
  })

  watch(isScrolled, val => emit('scroll-change', val))
  
  onMounted(async () => {
    window.addEventListener('scroll', handleScroll)
    loadAllGuides();
    loadRequests();
  })
  
  onUnmounted(() => window.removeEventListener('scroll', handleScroll))
</script>


<style scoped>

.text-shadow-custom {
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.25);
}

</style>
