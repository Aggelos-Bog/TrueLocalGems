<template>
  <v-hover v-slot="{ isHovering, props }">
    <v-card
      v-bind="props"
      :elevation="isHovering ? 12 : 3"
      class="traveller-card rounded-xl transition-swing mx-auto d-flex flex-column"
      max-width="300"
      height="450"
    >
      <!-- Gradient Header -->
      <div class="card-header d-flex align-center px-4">
        <!-- Avatar with Initials (Glassmorphism) -->
        <div class="avatar-glass d-flex align-center justify-center mr-4">
          <span class="text-h5 font-weight-bold text-white">{{ locationIso }}</span>
        </div>

        <!-- Location Text -->
        <div class="text-white">
          <div class="text-h6 font-weight-bold lh-1">{{ cityName }},</div>
          <div class="text-h6 font-weight-bold lh-1">{{ countryName }}</div>
          <div class="text-subtitle-2 font-weight-regular mt-1">by {{ request.user_name }}</div>
        </div>
      </div>

      <!-- Body Section -->
      <div class="card-body pa-4 flex-grow-1 d-flex flex-column">
        
        <!-- Title & Subtitle -->
        <div class="mb-4">
          <h3 class="text-h5 font-weight-medium serif-text mb-1">{{ request.title }}</h3>
          <div class="text-body-2 text-grey-darken-1 font-weight-regular lh-1-4">
            Looking for a guide in {{ cityName }}, {{ countryName }}
          </div>
        </div>

        <v-divider class="mb-3"></v-divider>

        <!-- Dates -->
        <div class="d-flex align-center mb-3">
          <v-icon icon="mdi-calendar-range" size="small" class="mr-2"></v-icon>
          <div class="text-body-2 font-weight-medium">
            {{ formatDate(request.date_from) }} - {{ formatDate(request.date_to) }}
          </div>
        </div>

        <!-- Interests -->
        <div class="mb-1 flex-grow-1">
          <div class="d-flex align-center mb-2">
            <v-icon icon="mdi-heart" size="small" color="secondary" class="mr-2"></v-icon>
            <div class="text-body-2 font-weight-medium">Interests</div>
          </div>
          
          <div class="d-flex flex-wrap gap-1">
            <v-chip
              v-for="(item, i) in interestsList"
              :key="i"
              class="interest-chip mb-1 mr-1 chip-bordered"
              :color="getChipColor(i)"
              variant="flat"
              size="small"
              elevation="2"
            >
              {{ item }}
            </v-chip>
          </div>
        </div>
      </div>
    </v-card>
  </v-hover>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    request: {
        type: Object,
        required: true
    }
});

// Helper to access nested city/country properties safely
const cityName = computed(() => {
    if (!props.request.city) return '';
    // If it's an object with name, use that. Otherwise use directly if string.
    return props.request.city.name || props.request.city;
});

const countryName = computed(() => {
    if (!props.request.country) return '';
    return props.request.country.name || props.request.country;
});

// Extract ISO from dataset or direct property
const locationIso = computed(() => {
    // Try to find ISO in country
    if (props.request.country) {
        if (props.request.country.iso) return props.request.country.iso;
        if (props.request.country.dataset && props.request.country.dataset.iso) return props.request.country.dataset.iso;
    }
    // Try to find ISO in city
    if (props.request.city) {
        if (props.request.city.iso) return props.request.city.iso;
        if (props.request.city.dataset && props.request.city.dataset.iso) return props.request.city.dataset.iso;
    }
    // Fallback logic could be first 2 letters of country or city if available, else 'AD'
    const cName = countryName.value;
    if (cName && typeof cName === 'string' && cName.length >= 2) {
        return cName.substring(0, 2).toUpperCase();
    }
    return 'AD'; 
});

const interestsList = computed(() => {
    if (!props.request.interests) return [];
    if (Array.isArray(props.request.interests)) return props.request.interests;
    return props.request.interests.split(',').map(s => s.trim());
});

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Pastel/Vibrant palette for chips
const chipColors = [
    '#FFCC80', // Orange/Apricot
    '#90CAF9', // Blue
    '#CE93D8', // Purple
    '#EF9A9A', // Red/Pink
    '#A5D6A7', // Green
    '#FFF59D'  // Yellow
];

function getChipColor(index) {
    return chipColors[index % chipColors.length];
}
</script>

<style scoped>
.traveller-card {
  overflow: hidden;
  background-color: #ffe0b2; /* Base peach color to match bottom of gradient */
}

.card-header {
  height: 200px;
  background: linear-gradient(135deg, #74b4cf 0%, #fad0c4 100%);
  /* Example gradient: Soft Blue to Peach/Pink */
}

/* Glassmorphism Avatar */
.avatar-glass {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.card-body {
  background-color: #fff0e0; /* Very light peach/beige */
  /* If you want the exact color from image, adjust here. 
     The image looks like a solid light beige/apricot tone. */
  background-color: #FDF1E6; 
}

.lh-1 {
  line-height: 1.1;
}

.lh-1-4 {
  line-height: 1.4;
}

.serif-text {
  font-family: "Georgia", serif !important; /* Or any serif font available */
}

.interest-chip {
  font-weight: 500;
  color: #333 !important; /* Ensure text is readable on pastel colors */
}

.chip-bordered {
  border: 1px solid #000 !important;
  transition: box-shadow 0.25s ease, transform 0.25s ease;
}

.chip-bordered:hover {
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.30) !important;
  transform: translateY(-2px);
}
</style>
