<template>
  <!-- Spacer for app bar -->
  <div style="height: 80px;"></div>

  <v-container fluid :style="{ width: mobile ? '95%' : '80%', marginTop: '20px' }">
    
    <v-row justify="center">
      <v-col cols="12" md="10" lg="8">
        
        <v-card elevation="4" rounded="xl" class="pa-8 card-hover">
          
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
                readonly
              ></v-text-field>
            </div>

            <!-- Location Row -->
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="request.country"
                  label="Country"
                  variant="solo"
                  rounded="lg"
                  bg-color="white"
                  readonly
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="request.city"
                  label="City"
                  variant="solo"
                  rounded="lg"
                  bg-color="white"
                  readonly
                ></v-text-field>
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
                  readonly
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
                  readonly
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
                readonly
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
                readonly
              ></v-textarea>
            </div>
            
             <!-- Back Button -->
            <div class="d-flex justify-center">
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
            </div>

          </v-form>

        </v-card>
      </v-col>
    </v-row>

  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useDisplay } from 'vuetify';

const { mobile } = useDisplay();
const route = useRoute();
const router = useRouter();

const request = ref({
  user_name: '',
  title: '',
  country: '',
  city: '',
  date_from: null,
  date_to: null,
  interests: [],
  description: ''
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
             // Interests comes as string perhaps? "A, B" -> split if needed, but backend insert used ".join(', ')" presumably?
             // Actually backend insert used form.value.interests.join(', '). So it is a string.
             // Combobox expects array for multiple chips.
             
             let interestsArray = [];
             if (data.interests && typeof data.interests === 'string') {
                 interestsArray = data.interests.split(',').map(s => s.trim());
             } else if (Array.isArray(data.interests)) {
                 interestsArray = data.interests;
             }

            request.value = {
                ...data,
                interests: interestsArray,
                // Dates might need formatting to YYYY-MM-DD for input type=date if they come as ISO string
                date_from: data.date_from ? data.date_from.split('T')[0] : null,
                date_to: data.date_to ? data.date_to.split('T')[0] : null
            };
        } else {
            console.error("Failed to fetch request");
        }
    } catch (err) {
        console.error("Error loading request:", err);
    }
};

onMounted(() => {
    loadRequest();
});

</script>

<style scoped>
.card-hover {
  transition: transform 0.2s ease;
}
</style>
