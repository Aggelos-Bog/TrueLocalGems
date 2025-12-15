<template>
  <!-- Spacer for app bar -->
  <div style="height: 80px;"></div>

  <v-container fluid style="width: 80%; margin-top: 20px;">
    
    <v-row justify="center">
      <v-col cols="12" md="10" lg="8">
        
        <v-card elevation="4" rounded="xl" class="pa-8 card-hover">
          
          <div class="text-h5 font-weight-bold mb-6 text-center">Create a Trip Request</div>

          <v-form @submit.prevent="submitRequest" v-model="valid">
            
            <!-- Title -->
            <div class="mb-4">
              <v-text-field
                v-model="form.title"
                label="Trip Title"
                variant="solo"
                rounded="lg"
                bg-color="white"
                :rules="[v => !!v || 'Title is required']"
              ></v-text-field>
            </div>

            <!-- Location Row -->
            <v-row>
              <v-col cols="12" md="6">
                <v-autocomplete
                  v-model="form.country"
                  label="Country"
                  variant="solo"
                  rounded="lg"
                  bg-color="white"
                  :items="countries.map(c => c.name)"
                  :rules="[v => !!v || 'Country is required']"
                ></v-autocomplete>
              </v-col>
              <v-col cols="12" md="6">
                <v-autocomplete
                  v-model="form.city"
                  label="City"
                  variant="solo"
                  rounded="lg"
                  bg-color="white"
                  :items="cityOptions"
                  :disabled="isCityDisabled"
                  :rules="[v => !!v || 'City is required']"
                ></v-autocomplete>
              </v-col>
            </v-row>

            <!-- Dates Row -->
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.date_from"
                  label="Date From"
                  type="date"
                  variant="solo"
                  rounded="lg"
                  bg-color="white"
                  :rules="[v => !!v || 'Start date is required']"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.date_to"
                  label="Date To"
                  type="date"
                  variant="solo"
                  rounded="lg"
                  bg-color="white"
                  :rules="[v => !!v || 'End date is required']"
                ></v-text-field>
              </v-col>
            </v-row>

            <!-- Interests -->
            <div class="mb-4">
              <v-combobox
                v-model="form.interests"
                label="Interests"
                multiple
                chips
                closable-chips
                variant="solo"
                rounded="lg"
                bg-color="white"
              ></v-combobox>
            </div>

            <!-- Description -->
            <div class="mb-6">
              <v-textarea
                v-model="form.description"
                label="Description"
                rows="6"
                variant="solo"
                rounded="lg"
                bg-color="white"
                :rules="[v => !!v || 'Description is required']"
              ></v-textarea>
            </div>


            <!-- Submit Button -->
            <div class="d-flex justify-center">
              <v-btn
                type="submit"
                color="primary"
                size="large"
                rounded="pill"
                min-width="200"
                :loading="loading"
              >
                Create Request
              </v-btn>
            </div>

          </v-form>

        </v-card>
      </v-col>
    </v-row>


    <!-- Success Snackbar -->
    <v-snackbar
      v-model="showSuccess"
      color="success"
      timeout="3000"
      location="top"
    >
      Trip request created successfully!
    </v-snackbar>

  </v-container>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCityStore } from "@/stores/useCityStore";

const router = useRouter();
const cityStore = useCityStore();

const valid = ref(false);
const loading = ref(false);
const showSuccess = ref(false);

const countries = ref([]);
const cityOptions = ref([]);
const isCityDisabled = ref(true);

const form = ref({
  title: '',
  country: null,
  city: null,
  date_from: null,
  date_to: null,
  interests: [],
  description: ''
});

// Load Countries
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

// Watch Country for City
watch(() => form.value.country, (selectedName) => {
   if (!selectedName) {
      isCityDisabled.value = true;
      form.value.city = null;
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

async function submitRequest() {
  if (!valid.value) return;
  
  loading.value = true;

  try {
    const payload = {
      ...form.value,
      interests: form.value.interests.join(', ') // Convert array to string for text column
    };

    const res = await fetch('http://localhost:3000/api/requests', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // "Authorization": `Bearer ${localStorage.getItem("token")}` // Uncomment if auth required
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error("Failed to create request");

    showSuccess.value = true;
    setTimeout(() => {
        router.push('/my-trips'); // Redirect to my trips (or home user choice)
    }, 1500);

  } catch (error) {
    console.error(error);
    alert("Error creating trip request");
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
    loadCountries();
});

</script>

<style scoped>
.card-hover {
  transition: transform 0.2s ease;
}
.card-hover:hover {
  transform: translateY(-2px);
}
</style>
