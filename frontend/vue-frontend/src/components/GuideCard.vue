<template>
  <v-hover v-slot="{ isHovering, props }">
    <v-card
      v-bind="props"
      :elevation="isHovering ? 12 : 3"
      class="guide-card rounded-xl transition-swing"
      max-width="300"
    >
      <!-- Profile Image -->
      <v-img
        src="https://cdn.vuetifyjs.com/images/cards/cooking.png"
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
            <h3 class="text-h6 font-weight-regular">Fotis</h3>
            <div class="text-caption text-grey-darken-3">Athens,Greece</div>
          </v-col>
          <v-col cols="4" class="text-right">
            <div class="text-h6 font-weight-regular">27€/h</div>
          </v-col>
        </v-row>

        <v-divider class="my-3 border-opacity-50" color="grey"></v-divider>

        <v-row no-gutters class="align-center">
          <v-col cols="4" class="text-center">
            <div class="text-h6 font-weight-regular">1</div>
            <div class="text-caption text-grey-darken-3">Reviews</div>
          </v-col>
          <v-col cols="8" class="text-center">
            <v-rating
              :model-value="4"
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
// Hardcoded for now as requested
</script>

<style scoped>
.guide-card {
  overflow: hidden;
}

.info-section {
  background-color: #ffe0cc; /* Peach/Beige color from the image */
}
</style>
