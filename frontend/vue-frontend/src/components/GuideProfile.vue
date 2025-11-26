<template>
  <!-- Spacer for app bar -->
  <div style="height: 80px;"></div>

  <v-container fluid style="width: 80%; margin-top: 20px;">
    
    <v-row>

      <!-- LEFT COLUMN -->
      <v-col cols="12" md="4">
        <v-card elevation="4" rounded="xl" class="pa-4 card-hover" style="height: 250px;">
          <v-row class="fill-height">

            <!-- LEFT SIDE -->
            <v-col cols="6" class="d-flex flex-column align-center justify-center">
              <v-avatar size="80" class="mb-2">
                <v-img :src="guide?.img_url || heroImage" />
              </v-avatar>

              <div class="text-subtitle-1 font-weight-medium">
                {{ guide?.name || "Unknown" }}
              </div>

              <div class="text-caption text-medium-emphasis">Local guide</div>
            </v-col>

            <v-divider vertical class="my-auto" style="height: 70%;"></v-divider>

            <!-- RIGHT SIDE -->
            <v-col cols="6" class="d-flex flex-column justify-center pl-4">

              <div class="mb-3">
                <div class="text-subtitle-1 font-weight-bold">
                  {{ guide?.reviews_count || 0 }}
                </div>
                <div class="text-caption text-medium-emphasis">Reviews</div>
              </div>

              <v-divider style="height: 80%;"></v-divider>

              <div class="mb-3">
                <v-rating
                  :model-value="Number(guide?.rating_avg)"
                  length="5"
                  size="16"
                  color="amber"
                  density="compact"
                  readonly
                ></v-rating>

                <div class="text-caption text-medium-emphasis">Rating</div>
              </div>

              <v-divider style="height: 80%;"></v-divider>

              <div>
                <div v-if="!isEditing">
                  {{ guide?.price_per_hour }} €/h
                </div>

                <v-text-field
                  v-else
                  v-model="editForm.price_per_hour"
                  type="number"
                  label="Price per hour"
                ></v-text-field>
              </div>

            </v-col>
          </v-row>
        </v-card>
      </v-col>

      <!-- RIGHT COLUMN -->
      <v-col cols="12" md="8">
        <v-card elevation="4" rounded="xl" class="pa-8 card-hover">

          <div class="d-flex justify-space-between align-center mb-4">
            <div class="text-h6">About me</div>
            <v-icon @click="toggleEdit">
              {{ isEditing ? 'mdi-check' : 'mdi-pencil' }}
            </v-icon>

          </div>

          <div class="my-2">
            <strong v-if="!isEditing">Language :</strong>

            <template v-if="!isEditing">
              {{ guide?.languages?.join(', ') }}
            </template>

            <v-autocomplete
              v-else
              v-model="editForm.languages"
              label="Languages"
              :items="languageOptions"
              variant="outlined"
              multiple
              chips
              clearable
              closable-chips
            ></v-autocomplete>

          </div>


          <div class="my-2">
            <strong v-if="!isEditing">From :</strong>

            <template v-if="!isEditing">
              {{ guide?.city }}, {{ guide?.country }}
            </template>

            <template v-else>
              <v-row>
                <v-col cols="6">
                  <v-autocomplete
                    v-model="editForm.city"
                    label="City"
                    :items="cityOptions"
                    :disabled="isCityDisabled"
                    variant="outlined"
                    clearable
                  ></v-autocomplete>

                </v-col>
                <v-col cols="6">
                  <v-autocomplete
                    v-model="editForm.country"
                    label="Country"
                    variant="outlined"
                    :items="countries.map(c => c.name)"
                    clearable
                  ></v-autocomplete>

                </v-col>
              </v-row>
            </template>
          </div>


          <p class="my-4" style="white-space: pre-line;" v-if="!isEditing">
            {{ guide?.bio }}
          </p>

          <v-textarea
            v-else
            v-model="editForm.bio"
            label="Biography"
            rows="6"
          ></v-textarea>


          <div class="my-2">
            <strong v-if="!isEditing">Interests:</strong>
          </div>

          <div v-if="!isEditing">
            {{ guide?.interests?.join(" | ") }}
          </div>

          <v-combobox
            v-else
            v-model="editForm.interests"
            label="Interests"
            multiple
            chips
            closable-chips
            clearable
            hide-selected
          ></v-combobox>



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
  import { ref, onMounted, watch } from "vue";
  import { useRoute } from "vue-router";
  import heroImage from "@/assets/images/home-page.png";
  import { useCityStore } from "@/stores/useCityStore";
  
  const cityStore = useCityStore();
  const languageOptions = ref([]);
  const countries = ref([]);
  const cityOptions = ref([]);
  const isCityDisabled = ref(true);


  const route = useRoute();
  const guideId = route.params.id;

  const guide = ref(null);
  const loading = ref(true);
  const error = ref(null);

  const isEditing = ref(false);
  const editForm = ref({});

  watch(() => editForm.value.country, (selectedName) => {
   if (!selectedName) {
      isCityDisabled.value = true;
      editForm.value.city = null;
      cityOptions.value = [];
      return;
    }

    const country = countries.value.find(c => c.name === selectedName);
    if (!country) {
      cityOptions.value = [];
      return;
    }

    isCityDisabled.value = false;
    cityOptions.value = cityStore.getCitiesByIso(country.code);
  });


  async function toggleEdit() {
    // ENTER EDIT MODE
    if (!isEditing.value) {
      editForm.value = JSON.parse(JSON.stringify(guide.value));

      // Load dropdown data before showing edit fields
      await loadLanguages();
      await loadCountries();

      // Preload city list
      const selectedCountry = countries.value.find(c => c.name === guide.value.country);

      if (selectedCountry) {
        cityOptions.value = cityStore.getCitiesByIso(selectedCountry.code);
        isCityDisabled.value = false;
      }

      isEditing.value = true;
      return;
    }


    // LEAVING EDIT MODE → SAVE TO BACKEND
    try {
      const payload = {
        ...editForm.value,
        // Ensure strings converted to arrays for DB
        languages: typeof editForm.value.languages === "string"
          ? editForm.value.languages.split(",").map(s => s.trim())
          : editForm.value.languages,

        interests: typeof editForm.value.interests === "string"
          ? editForm.value.interests.split(",").map(s => s.trim())
          : editForm.value.interests
      };

      const res = await fetch(`http://localhost:3000/guides/${guideId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error("Failed to update guide");
      }

      const updatedGuide = await res.json();

      // Update UI
      guide.value = updatedGuide;

      console.log("Guide updated successfully");
    } catch (err) {
      console.error("Update failed:", err);
    }

    isEditing.value = false;
  }


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

  const loadLanguages = async () => {
    try {
      const res = await fetch("https://api.languagetoolplus.com/v2/languages");
      const data = await res.json();

      const names = data.map(l => l.name);
      const uniqueNames = [...new Set(names)];

      languageOptions.value = uniqueNames;
    } catch (err) {
      console.error("Failed to load languages:", err);
    }
  };

  const loadCountries = async () => {
    try {
      const res = await fetch(
        'https://restcountries.com/v3.1/region/europe?fields=name,cca2'
      );
      const data = await res.json();

      countries.value = data
        .map(c => ({
          name: c.name.common,
          code: c.cca2
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error('Error fetching countries:', error);
    }
  };



  onMounted(loadGuide);
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
