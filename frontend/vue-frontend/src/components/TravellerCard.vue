<template>
  <v-hover v-slot="{ isHovering, props }">
    <v-card
      v-bind="props"
      :elevation="isHovering ? 12 : 3"
      class="traveller-card rounded-xl transition-swing mx-auto"
      max-width="300"
    >
      <!-- Profile Image -->
      <v-img
        src="https://cdn.vuetifyjs.com/images/lists/1.jpg"
        height="200"
        cover
        class="align-end"
      >
      </v-img>

      <!-- Info Section -->
      <div class="info-section pa-4">
        <v-row no-gutters class="align-center mb-2">
          <v-col cols="12">
            <h3 class="text-h6 font-weight-regular traveller-name">{{ request.title }}</h3>
            <div class="text-caption text-grey-darken-3 traveller-subtitle">
                 Looking for a guide in {{ request.city }}, {{ request.country }}
            </div>
          </v-col>
        </v-row>

        <v-divider class="my-3 border-opacity-50" color="grey"></v-divider>

        <!-- Dates Section -->
        <div class="d-flex align-center mb-3">
          <v-icon size="small" class="mr-2">mdi-calendar-range</v-icon>
          <div class="text-body-2 font-weight-medium">
            {{ formatDate(request.date_from) }} - {{ formatDate(request.date_to) }}
          </div>
        </div>

        <!-- Interests Section -->
        <div class="mb-1">
          <div class="d-flex align-center mb-2">
            <v-icon size="small" color="secondary" class="mr-2">mdi-heart</v-icon>
            <div class="text-body-2 font-weight-medium">Interests</div>
          </div>
          
          <div class="d-flex flex-wrap pl-6">
            <v-chip
              v-for="(item, i) in interestsList"
              :key="i"
              density="compact"
              color="primary"
              class="mb-1 mr-1 small-chip chip-bordered"
              variant="flat"
              elevation="3"
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

const interestsList = computed(() => {
    if (!props.request.interests) return [];
    // If it's already an array, return it. If string, split it.
    // Based on previous service code, we sent a string join.
    if (Array.isArray(props.request.interests)) return props.request.interests;
    return props.request.interests.split(',').map(s => s.trim());
});

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
</script>

<style scoped>
.traveller-card {
  overflow: hidden;
}

.info-section {
  background-color: #ffe1cc; /* Peach/Beige color */
}

.traveller-name {
  font-size: 1.1rem;
  font-weight: 600;
}

.traveller-subtitle {
  opacity: 0.7;
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




</style>
