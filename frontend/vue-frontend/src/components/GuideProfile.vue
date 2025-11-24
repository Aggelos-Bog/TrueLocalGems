<template>
  <!-- Spacer for app bar -->
  <div style="height: 80px;"></div>

  <v-container fluid style="width: 80%; margin-top: 20px;">
    
    <v-row>

      <!-- LEFT COLUMN (fixed height desktop, auto mobile) -->
      <v-col cols="12" md="4">
      <v-card
        elevation="4"
        rounded="xl"
        class="pa-4 card-hover"
        style="height: 250px;"
        >
        <v-row class="fill-height">

            <!-- LEFT SIDE — 30% -->
            <v-col cols="6" class="d-flex flex-column align-center justify-center">
            <v-avatar size="80" class="mb-2">
                <v-img :src="heroImage" />
            </v-avatar>

            <div class="text-subtitle-1 font-weight-medium">Fotis</div>
            <div class="text-caption text-medium-emphasis">Local guide</div>
            </v-col>

            <v-divider vertical class="my-auto" style="height: 70%;"></v-divider>

            <!-- RIGHT SIDE — 70% -->
            <v-col cols="6" class="d-flex flex-column justify-center pl-4">

            <div class="mb-3">
                <div class="text-subtitle-1 font-weight-bold">2</div>
                <div class="text-caption text-medium-emphasis">Reviews</div>
            </div>

            <v-divider style="height: 80%;"></v-divider>

            <div class="mb-3">
                <v-rating
                    length="5"
                    size="16"
                    model-value="4"
                    color="amber"
                    density="compact"
                    readonly
                ></v-rating>
                <div class="text-caption text-medium-emphasis">Rating</div>
            </div>

            <v-divider style="height: 80%;"></v-divider>
            
            <div>
                <div class="text-h6 font-weight-bold">27€/h</div>
            </div>

            </v-col>

        </v-row>
        </v-card>


      </v-col>

      <!-- RIGHT COLUMN (auto height) -->
      <v-col cols="12" md="8">
        <v-card
          elevation="4"
          rounded="xl"
          class="pa-8 card-hover"
        >

          <div class="d-flex justify-space-between align-center mb-4">
            <div class="text-h6">About me</div>
            <v-icon>mdi-pencil</v-icon>
          </div>

          <div class="my-2">
            <strong>Language :</strong> English, Greek
          </div>

          <div class="my-2">
            <strong>From :</strong> Athens, Greece
          </div>

          <p class="my-4">
            Hello, I'm Fotis! I was born in Athens, I've traveled, hiked and lived 
            abroad, including a decade in New York...
            Hello, I'm Fotis! I was born in Athens, I've traveled, hiked and lived 
            abroad, including a decade in New York...
            Hello, I'm Fotis! I was born in Athens, I've traveled, hiked and lived 
            abroad, including a decade in New York...
            Hello, I'm Fotis! I was born in Athens, I've traveled, hiked and lived 
            abroad, including a decade in New York...
            Hello, I'm Fotis! I was born in Athens, I've traveled, hiked and lived 
            abroad, including a decade in New York...
            Hello, I'm Fotis! I was born in Athens, I've traveled, hiked and lived 
            abroad, including a decade in New York...
            Hello, I'm Fotis! I was born in Athens, I've traveled, hiked and lived 
            abroad, including a decade in New York...
            Hello, I'm Fotis! I was born in Athens, I've traveled, hiked and lived 
            abroad, including a decade in New York...
            Hello, I'm Fotis! I was born in Athens, I've traveled, hiked and lived 
            abroad, including a decade in New York...
            Hello, I'm Fotis! I was born in Athens, I've traveled, hiked and lived 
            abroad, including a decade in New York...
          </p>

          <div class="my-2">
            <strong>Interests:</strong>
          </div>

          <div>
            Nice Food | Nice views | Nice Food | Nice views | Nice Food |
            Nice views | Nice Food | Nice views | Nice Food | Nice views
          </div>

        </v-card>
      </v-col>

    </v-row>

    <v-divider style="width: 100%;" class="my-10"></v-divider>

    <div class="d-flex align-center mb-6">
        <div class="text-h6 font-weight-bold">Reviews</div>
    </div>

    <v-row>
        <v-col cols="12" md="8">
            <v-card
            elevation="2"
            rounded="xl"
            class="pa-4 mb-4 review-card card-hover"
            >
                <v-row>
                    
                    <!-- LEFT SIDE: Avatar + user info -->
                    <v-col cols="12" md="3" class="d-flex flex-column align-center">
                    <v-avatar size="70" class="mb-2">
                        <v-img :src="heroImage" />
                    </v-avatar>

                    <div class="text-subtitle-2 font-weight-bold">George</div>
                    <div class="text-caption text-medium-emphasis mb-1">as a traveller</div>

                    <div class="text-caption text-medium-emphasis">
                        21/02/2025
                    </div>
                    </v-col>

                    <!-- RIGHT SIDE: Review text + stars -->
                    <v-col cols="12" md="9">
                    
                    <div class="text-body-2 mb-2" style="line-height: 1.4;">
                        I had a wonderful time exploring Athens with Mina. She was a wonderful
                        tour guide and showed me all of Athens highlights and Greek foods to try.
                        She also gave excellent tips on where to buy good priced souvenirs and
                        was an excellent photographer. Finally Mina was very warm and friendly
                        and I would highly recommend her should you visit Athens. Visit June 2025.
                    </div>

                    <v-rating
                        model-value="4"
                        length="5"
                        size="20"
                        color="amber"
                        density="compact"
                        readonly
                    ></v-rating>

                    </v-col>

                </v-row>
            </v-card>

        </v-col>
    </v-row>

  </v-container>
</template>

<script setup>
  import { ref, onMounted, defineEmits } from "vue";
  import { useRoute } from "vue-router";
  import heroImage from "@/assets/images/home-page.png";
  defineEmits(["scroll-change"])

  const route = useRoute();
  const guideId = route.params.id;

  const guide = ref(null);
  const loading = ref(true);
  const error = ref(null);

  async function loadGuide() {
    try {
      const res = await fetch(`http://localhost:3000/guides/${guideId}`);
      if (!res.ok) throw new Error("Guide not found");

      guide.value = await res.json();
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  }

  onMounted(() => {
    loadGuide();
  });
</script>


<style scoped>
.card-hover {
  transition: box-shadow 0.25s ease, transform 0.2s ease;
}

.card-hover:hover {
  box-shadow: 0px 6px 20px rgba(0, 0, 0, 0.35) !important;
  transform: translateY(-1px); /* optional, gives a nice lift */
}
</style>
