<template>
  <v-hover v-slot="{ isHovering, props }">
    <v-card
      v-bind="props"
      :elevation="isHovering ? 12 : 3"
      class="guide-card rounded-xl transition-swing mx-auto"
      max-width="300"
      :to="{ name: 'GuideProfile', params: { id: guide.guide_id } }"
    >
      <!-- Profile Image or Letter Avatar -->
      <div class="guide-image-container" style="height: 200px; position: relative;">
        <!-- Actual Image (if available) -->
        <v-img
          v-if="guide.img_url"
          :src="guide.img_url"
          height="200"
          cover
          class="align-end"
        >
          <!-- Favorite Heart Icon -->
          <v-btn
            v-if="nav.role === 'traveller'"
            icon
            variant="text"
            class="position-absolute top-0 right-0 ma-2"
            @click.prevent="toggleFavorite"
          >
            <v-icon
              :color="isFavorite ? '#E3257B' : 'grey-lighten-1'"
              size="40"
            >
              {{ isFavorite ? 'mdi-heart' : 'mdi-heart' }}
            </v-icon>
          </v-btn>
        </v-img>

        <!-- Letter Avatar Fallback (if no image) -->
        <div 
          v-else 
          class="letter-avatar d-flex align-center justify-center"
        >
          <span class="avatar-letter">{{ guideInitial }}</span>
          
          <!-- Favorite Heart Icon for fallback too -->
          <v-btn
            v-if="nav.role === 'traveller'"
            icon
            variant="text"
            class="position-absolute top-0 right-0 ma-2"
            @click.prevent="toggleFavorite"
          >
            <v-icon
              :color="isFavorite ? '#E3257B' : 'grey-lighten-1'"
              size="40"
            >
              {{ isFavorite ? 'mdi-heart' : 'mdi-heart' }}
            </v-icon>
          </v-btn>
        </div>
      </div>

      <!-- Info Section -->
      <div class="info-section pa-4">
        <div class="mb-2">
          <h3 class="text-h6 font-weight-regular">{{ guide.name }}</h3>
          <div class="text-caption text-grey-darken-3 d-flex align-center">
            <v-icon size="small" color="pink" class="mr-1">mdi-map-marker</v-icon>
            {{ guide.city }}, {{ guide.country }}
          </div>
        </div>

        <v-divider class="my-3 border-opacity-50" color="grey"></v-divider>

        <v-row no-gutters>
          <v-col cols="6" class="text-left">
            <div class="text-subtitle-2 font-weight-bold">Price</div>
            <div class="text-h6 font-weight-regular">{{ guide.price_per_hour }}€/h</div>
          </v-col>
          <v-col cols="6" class="text-left">
            <div class="text-subtitle-2 font-weight-bold">Rating</div>
            <div class="d-flex align-center">
              <v-rating
                :model-value="Number(guide.rating_avg)"
                color="amber-lighten-1"
                active-color="amber-lighten-1"
                half-increments
                density="compact"
                size="small"
                readonly
              ></v-rating>
              <span class="text-caption ml-1">(0)</span>
            </div>
          </v-col>
        </v-row>

        <v-divider class="my-3 border-opacity-50" color="grey"></v-divider>

        <!-- Interests Section -->
        <div class="mt-3" v-if="guide.interests && guide.interests.length > 0">
          <div class="d-flex align-center mb-2">
            <v-icon size="small" color="secondary" class="mr-2">mdi-heart</v-icon>
            <div class="text-body-2 font-weight-medium">Interests</div>
          </div>
          
          <div class="d-flex flex-wrap pl-6">
            <v-chip
              v-for="(item, i) in guide.interests.slice(0, 3)"
              :key="i"
              density="compact"
              color="primary"
              class="mb-1 mr-1 small-chip chip-bordered"
              variant="flat"
              elevation="3"
            >
              {{ item }}
            </v-chip>
            <span v-if="guide.interests.length > 3" class="text-caption text-grey ml-1 align-self-center">
              +{{ guide.interests.length - 3 }}
            </span>
          </div>
        </div>
      </div>
    </v-card>
  </v-hover>

  <SuccessSnackbar
    v-model="snackbarVisible"
    :message="snackbarMessage"
    :color="snackbarColor"
    :timeout="2000"
  />
</template>

<script setup>
const props = defineProps({
  guide: {
    type: Object,
    required: true,
    default: () => ({
      guide_id: 0,
      name: 'Guide Name',
      city: 'City',
      country: 'Country',
      price_per_hour: 0,
      img_url: 'https://cdn.vuetifyjs.com/images/cards/cooking.png',
      rating_avg: 0,
      is_favorite: false,
      interests: []
    })
  }
})

import { ref, watch, computed } from 'vue'
import { useNavStore } from '@/stores/navStore'
import SuccessSnackbar from '@/components/SuccessSnackbar.vue'
import axios from 'axios'

const nav = useNavStore()
const isFavorite = ref(props.guide.is_favorite)

// Compute the first letter of the guide's name for avatar fallback
const guideInitial = computed(() => {
  if (props.guide.name && props.guide.name.length > 0) {
    return props.guide.name.charAt(0).toUpperCase();
  }
  return 'G';
});

// Snackbar state
const snackbarVisible = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref('success')

watch(() => props.guide.is_favorite, (val) => {
  isFavorite.value = val
})

async function toggleFavorite(e) {
  e.stopPropagation(); // Prevent card click
  e.preventDefault();

  const token = localStorage.getItem("token");
  if (!token) {
    alert("Please login to add favorites!");
    return;
  }

  // Optimistic update
  const previousState = isFavorite.value;
  isFavorite.value = !isFavorite.value;

  try {
    await axios.post(`http://localhost:3000/guides/${props.guide.guide_id}/favorite`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    // Show feedback
    if (isFavorite.value) {
      snackbarMessage.value = "Guide added to favorites"
      snackbarColor.value = "accent" // or #E3257B
    } else {
      snackbarMessage.value = "Guide removed from favorites"
      snackbarColor.value = "grey-darken-3"
    }
    snackbarVisible.value = true

  } catch (err) {
    console.error(err);
    // Revert on error
    isFavorite.value = previousState;
    alert("Failed to update favorite");
  }
}
</script>

<style scoped>
.guide-card {
  overflow: hidden;
}

.info-section {
  background-color: #ffe0cc; /* Peach/Beige color from the image */
}

.small-chip {
  font-size: 12px;
  padding-inline: 8px;
  height: 24px;
  opacity: 0.7;
}

.chip-bordered {
  border: 1px solid #000 !important;
  transition: box-shadow 0.25s ease, transform 0.25s ease;
}

.chip-bordered:hover {
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.30) !important;
  transform: translateY(-2px);
}

/* Letter Avatar Fallback Styles */
.letter-avatar {
  height: 200px;
  width: 100%;
  background: linear-gradient(135deg, rgba(116, 180, 207, 0.3) 0%, rgba(250, 208, 196, 0.3) 100%);
  position: relative;
}

.avatar-letter {
  font-size: 80px;
  font-weight: bold;
  color: #8B2548; /* Secondary color */
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
  user-select: none;
}
</style>
