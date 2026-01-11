<template>
  <!-- Spacer for app bar -->
  <div style="height: 80px;"></div>

  <v-container fluid :style="{ width: mobile ? '95%' : '80%', marginTop: '20px' }">
    
    <v-row justify="center">
      <v-col cols="12" md="10" lg="8">
        
        <v-card elevation="4" rounded="xl" class="pa-8 card-hover" style="position: relative;">
          
          <!-- Edit Button for Creator -->
          <v-btn
            v-if="isCreator"
            :icon="isEditing ? 'mdi-close' : 'mdi-pencil'"
            variant="text"
            color="black"
            position="absolute"
            location="top right"
            class="ma-2"
            @click="isEditing = !isEditing"
          ></v-btn>

          <div class="text-h5 font-weight-bold mb-6 text-center secondary font-italic text-shadow-custom">
            <span class="font-weight-bold accent">Trip</span> Request from {{ request.user_name }}
          </div>

          <v-form>
            
            <!-- Traveller Name -->
             <!-- We can omit this if the header says "Request for [Name]" or keep it for consistency. I'll keep it as consistent with CreateTripView -->
            <div class="mb-4">
              <v-text-field
                v-model="request.user_name"
                label="Traveller Name"
                variant="solo"
                rounded="lg"
                bg-color="white"
                readonly
              ></v-text-field>
            </div>

            <!-- Title -->
            <div class="mb-4">
              <v-text-field
                v-model="request.title"
                label="Trip Title"
                variant="solo"
                rounded="lg"
                bg-color="white"
                :readonly="!isEditing"
              ></v-text-field>
            </div>

            <!-- Location Row -->
            <v-row>
              <v-col cols="12" md="6">
                <v-autocomplete
                  v-model="request.country"
                  label="Country"
                  variant="solo"
                  rounded="lg"
                  bg-color="white"
                  :items="countries.map(c => c.name)"
                  :readonly="!isEditing"
                ></v-autocomplete>
              </v-col>
              <v-col cols="12" md="6">
                <v-autocomplete
                  v-model="request.city"
                  label="City"
                  variant="solo"
                  rounded="lg"
                  bg-color="white"
                  :items="cityOptions"
                  :disabled="isCityDisabled"
                  :readonly="!isEditing"
                ></v-autocomplete>
              </v-col>
            </v-row>

            <!-- Dates Row -->
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="request.date_from"
                  label="Date From"
                  type="date"
                  variant="solo"
                  rounded="lg"
                  bg-color="white"
                  :readonly="!isEditing"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="request.date_to"
                  label="Date To"
                  type="date"
                  variant="solo"
                  rounded="lg"
                  bg-color="white"
                  :readonly="!isEditing"
                ></v-text-field>
              </v-col>
            </v-row>

            <!-- Interests -->
            <div class="mb-4">
              <v-combobox
                v-model="request.interests"
                label="Interests"
                multiple
                chips
                variant="solo"
                rounded="lg"
                bg-color="white"
                :readonly="!isEditing"
              ></v-combobox>
            </div>

            <!-- Description -->
            <div class="mb-6">
              <v-textarea
                v-model="request.description"
                label="Description"
                rows="6"
                variant="solo"
                rounded="lg"
                bg-color="white"
                :readonly="!isEditing"
              ></v-textarea>
            </div>
            
             <!-- Action Buttons -->
            <div class="d-flex justify-center ga-4">
              <v-btn
                color="secondary"
                size="large"
                rounded="pill"
                min-width="200"
                style="text-transform: none !important;"
                @click="router.back()"
              >
                Back
              </v-btn>

              <!-- Send Message Button (for guides only) -->
              <v-btn
                v-if="isGuide && !isCreator"
                color="primary"
                size="large"
                rounded="pill"
                min-width="200"
                style="text-transform: none !important;"
                prepend-icon="mdi-message"
                @click="startChat"
              >
                Send Message
              </v-btn>

              <!-- Submit Button -->
              <v-btn
                v-if="isCreator && isEditing"
                color="lime-darken-2"
                size="large"
                rounded="pill"
                min-width="200"
                style="text-transform: none !important;"
                prepend-icon="mdi-check"
                @click="updateRequest"
              >
                Submit
              </v-btn>
            </div>

          </v-form>

        </v-card>
      </v-col>
    </v-row>

  </v-container>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useDisplay } from 'vuetify';
import { jwtDecode } from "jwt-decode";
import { useCityStore } from "@/stores/useCityStore";

const { mobile } = useDisplay();
const route = useRoute();
const router = useRouter();
const cityStore = useCityStore();

const countries = ref([]);
const cityOptions = ref([]);
const isCityDisabled = ref(true);

const request = ref({
  user_name: '',
  title: '',
  country: null,
  city: null,
  date_from: null,
  date_to: null,
  interests: [],
  description: ''
});

const isCreator = ref(false);
const isEditing = ref(false);
const isGuide = ref(false);

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

watch(() => request.value.country, (selectedName) => {
   if (!selectedName) {
      isCityDisabled.value = true;
      cityOptions.value = [];
      return;
    }

    const country = countries.value.find(c => c.name === selectedName);
    if (!country) {
      // If we loaded the request but countries aren't loaded yet, we might miss this.
      // But eventually countries will load.
      // Wait, if countries load AFTER request, we need to re-trigger?
      // No, watcher watches `country`. If country is set, it runs.
      // If countries list is empty, `find` fails.
      // We need to watch `countries` too? Or just re-run logic when countries load.
      cityOptions.value = [];
      return;
    }

    isCityDisabled.value = false;
    cityOptions.value = cityStore.getCitiesByIso(country.code);
});

// Also watch countries to re-evaluate city options if request loaded first
watch(countries, () => {
    if (request.value.country) {
        const selectedName = request.value.country;
        const country = countries.value.find(c => c.name === selectedName);
        if (country) {
            isCityDisabled.value = false;
            cityOptions.value = cityStore.getCitiesByIso(country.code);
        }
    }
});


const loadRequest = async () => {
    try {
        const id = route.params.id;
        if (!id) return;

        const res = await fetch(`http://localhost:3000/api/requests/${id}`, {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        });

        if (res.ok) {
            const data = await res.json();
            
             let interestsArray = [];
             if (data.interests && typeof data.interests === 'string') {
                 interestsArray = data.interests.split(',').map(s => s.trim());
             } else if (Array.isArray(data.interests)) {
                 interestsArray = data.interests;
             }

            request.value = {
                ...data,
                interests: interestsArray,
                date_from: data.date_from ? data.date_from.split('T')[0] : null,
                date_to: data.date_to ? data.date_to.split('T')[0] : null
            };

            const token = localStorage.getItem("token");
            if (token && data.user_id) {
                try {
                    const decoded = jwtDecode(token);
                    const currentUserId = decoded.id || decoded.user_id;
                    
                    if (currentUserId == data.user_id) {
                        isCreator.value = true;
                    }
                } catch (e) {
                    console.error("Error decoding token:", e);
                }
            }
        } else {
            console.error("Failed to fetch request");
        }
    } catch (err) {
        console.error("Error loading request:", err);
    }
};

const updateRequest = async () => {
    try {
        const id = route.params.id;
        const token = localStorage.getItem("token");
        
        const payload = {
            ...request.value,
            interests: Array.isArray(request.value.interests) ? request.value.interests.join(', ') : request.value.interests
        };

        const res = await fetch(`http://localhost:3000/api/requests/${id}`, {
            method: 'PATCH',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            console.log("Request updated successfully");
            isEditing.value = false;
            await loadRequest();
        } else {
            const error = await res.json();
            console.error("Failed to update request:", error);
        }
    } catch (err) {
        console.error("Error updating request:", err);
    }
};

const startChat = () => {
    const requestId = route.params.id;
    router.push(`/chat?request_id=${requestId}`);
};

onMounted(() => {
    loadCountries();
    loadRequest();
    
    // Check if user is a guide
    const token = localStorage.getItem("token");
    if (token) {
        try {
            const decoded = jwtDecode(token);
            isGuide.value = decoded.role === 1;
        } catch (e) {
            console.error("Error decoding token:", e);
        }
    }
});

</script>

<style scoped>
.card-hover {
  transition: transform 0.2s ease;
}
</style>
