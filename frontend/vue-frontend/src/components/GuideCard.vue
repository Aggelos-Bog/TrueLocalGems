<template>
  <v-hover v-slot="{ isHovering, props }">
    <v-card
      v-bind="props"
      :elevation="isHovering ? 12 : 3"
      class="guide-card rounded-xl transition-swing"
      max-width="300"
      :to="{ name: 'GuideProfile', params: { id: guide.guide_id } }"
    >
      <!-- Profile Image -->
      <v-img
        :src="guide.img_url || 'https://cdn.vuetifyjs.com/images/cards/cooking.png'"
        height="200"
        cover
        class="align-end"
      >
        <!-- Optional: Add a gradient or overlay if needed, but the image shows a clean photo -->
      </v-img>

      <!-- Info Section -->
      <div class="info-section pa-4">
        <v-row no-gutters class="align-center mb-2">
          <v-col cols="8">
            <h3 class="text-h6 font-weight-regular">{{ guide.name }}</h3>
            <div class="text-caption text-grey-darken-3">{{ guide.city }}, {{ guide.country }}</div>
          </v-col>
          <v-col cols="4" class="text-right">
            <div class="text-h6 font-weight-regular">{{ guide.price_per_hour }}€/h</div>
          </v-col>
        </v-row>

        <v-divider class="my-3 border-opacity-50" color="grey"></v-divider>

        <v-row no-gutters class="align-center">
          <v-col cols="4" class="text-center">
            <div class="text-h6 font-weight-regular">0</div>
            <div class="text-caption text-grey-darken-3">Reviews</div>
          </v-col>
          <v-col cols="8" class="text-center">
            <v-rating
              :model-value="Number(guide.rating_avg)"
              color="amber-lighten-1"
              active-color="amber-lighten-1"
              half-increments
              density="compact"
              size="small"
              readonly
            ></v-rating>
            <div class="text-caption text-grey-darken-3 mt-1">Rating</div>
          </v-col>
        </v-row>
      </div>
    </v-card>
  </v-hover>
</template>

<script setup>
defineProps({
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
      rating_avg: 0
    })
  }
})
</script>

<style scoped>
.guide-card {
  overflow: hidden;
}

.info-section {
  background-color: #ffe0cc; /* Peach/Beige color from the image */
}
</style>
