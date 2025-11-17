<template>
  <v-container class="d-flex align-center justify-center fill-height" fluid>
    <v-card
      width="420"
      class="pa-8 my-16 rounded-xl"
      elevation="2"
      color="white"
      style="border: 1px solid #e5e5e5"
    >
      <div class="text-center mb-6">
        <h2 class="text-h4 font-weight-medium" style="color:#333;">
          Register
        </h2>
      </div>

      <v-form ref="form" @submit.prevent="onSubmit">
        
        <!-- Animated Slide Wrapper -->
        <transition name="slide-x-transition">
          
          <!-- STEP 1 -->
          <div v-if="step === 1" key="step1">
            <v-text-field
              v-model="name"
              label="Name"
              variant="outlined"
              class="mb-4"
              :rules="[rules.required]"
            />

            <v-text-field
              v-model="email"
              label="Email"
              type="email"
              variant="outlined"
              class="mb-4"
              :rules="[rules.required, rules.email]"
            />


            <v-text-field
              v-model="password"
              label="Password"
              :type="showPassword ? 'text' : 'password'"
              variant="outlined"
              class="mb-4"
              :rules="[rules.required, rules.min6]"
              :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="showPassword = !showPassword"
            />


            <v-text-field
              v-model="passwordConfirm"
              label="Confirm Password"
              :type="showPasswordConfirm ? 'text' : 'password'"
              variant="outlined"
              class="mb-4"
              :rules="[rules.required, rules.matchPassword]"
              :append-inner-icon="showPasswordConfirm ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="showPasswordConfirm = !showPasswordConfirm"
            />

            <v-select
              v-model="role"
              label="Role"
              :items="['Traveller', 'Guide']"
              variant="outlined"
              class="mb-6"
              :rules="[rules.required]"
            />
          </div>

          <!-- STEP 2 → Guide extra info -->
          <div v-else key="step2">

            <v-autocomplete
              v-model="guide.language"
              label="Languages"
              :items="languageOptions"
              variant="outlined"
              class="mb-4"
              multiple
              chips
              closable-chips
              :rules="[rules.required]"
              clearable
            />

            <v-select
              v-model="guide.from"
              label="From"
              :items="countries"
              variant="outlined"
              class="mb-4"
              :rules="[rules.required]"
              clearable
            />

            <!-- NEW CITY FIELD -->
            <v-text-field
              v-model="guide.city"
              label="City"
              variant="outlined"
              class="mb-4"
              :rules="[rules.required]"
              clearable
            />

            <v-textarea
              v-model="guide.about"
              label="About Me"
              variant="outlined"
              rows="5"
              class="mb-4"
              :rules="[rules.required]"
            />

            <v-combobox
              v-model="guide.interests"
              label="Interests"
              multiple
              chips
              closable-chips
              clearable
              variant="outlined"
              class="mb-6"
              :rules="[rules.required]"
              placeholder="Type and press Enter..."
            />

            <!-- BACK BUTTON -->
            <v-btn
              block
              variant="outlined"
              class="mb-4"
              color="#8d0040"
              @click="step = 1"
            >
              Back
            </v-btn>
          </div>


        </transition>

        <!-- submit -->
        <v-btn
          type="submit"
          block
          height="44"
          class="rounded-lg"
          color="#8d0040"
          variant="flat"
        >
          {{ buttonText }}
        </v-btn>

       

      </v-form>

      <p class="text-center mt-4" style="color:#666;">
        Already have an account?
        <router-link to="/login" style="color:#e3257b; text-decoration: underline;">
          Sign In
        </router-link>
      </p>
    </v-card>
  </v-container>
</template>


<script setup>
  import { ref, computed, watch } from "vue";
  import { useRouter } from "vue-router";
  import { useNavStore } from '@/stores/navStore';

  const navStore = useNavStore();
  const router = useRouter();

  const step = ref(1);

  const name = ref("");
  const email = ref("");
  const password = ref("");
  const passwordConfirm = ref("");
  const role = ref("");
  const languageOptions = ref([]);
  const countries = ref([]);
  const showPassword = ref(false);
  const showPasswordConfirm  = ref(false);

  const guide = ref({
    language: [],
    from: "",
    city: "",
    about: "",
    interests: null
  });

  const form = ref(null);

  const rules = {
    required: v => !!v || "This field is required",
    email: v => /.+@.+\..+/.test(v) || "Enter a valid email",
    min6: v => v.length >= 6 || "Minimum 6 characters",
    matchPassword: v => v === password.value || "Passwords must match"
  };

  const buttonText = computed(() => {
    if (role.value === "Guide" && step.value === 1) return "Next";
    return "Create Account";
  });

  const onSubmit = async () => {
    // Step 1 → go to Step 2 if Guide
    if (step.value === 1 && role.value === "Guide") {
      const { valid } = await form.value.validate();
      if (!valid) return;
      step.value = 2;
      return;
    }

    // Final Submit
    const { valid } = await form.value.validate();
    if (!valid) return;

    try {
      const res = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.value,
          email: email.value,
          password: password.value,
          role: role.value === "Traveller" ? 0 : 1,
          guideDetails: guide.value   // <-- Extra guide data
        })
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);

        const roleString = data.user.role === 1 ? "guide" : "traveller";
        navStore.setRole(roleString);

        router.push("/");
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };



  // Load available languages from external API
  const loadLanguages = async () => {
    try {
      const res = await fetch("https://api.languagetoolplus.com/v2/languages");
      const data = await res.json();

      // Extract language names
      const names = data.map(l => l.name);

      // Dedupe (Vuetify CANNOT handle dupes)
      const uniqueNames = [...new Set(names)];

      languageOptions.value = uniqueNames;
    } catch (err) {
      console.error("Failed to load languages:", err);
    }
  };


  const loadCountries = async () => {
    try {
      const res = await fetch(
        'https://restcountries.com/v3.1/region/europe?fields=name'
      )
      const data = await res.json()

      countries.value = data
        .map(c => c.name.common)
        .sort()
    } catch (error) {
      console.error('Error fetching countries:', error)
    }
  };


  // Load languages, Countries when Step 2 is reached
  watch(step, (newStep) => {
    if (newStep === 2) {
      loadLanguages();
      loadCountries();
    }
  });
watch(
  () => guide.value.language,
  (newVal) => {
    console.log("Selected languages:", guide.value.language);
    console.log("Selected languages:", guide.value.about);
  },
  { deep: true } // because it's an array
);


  


</script>

<style scoped>
.slide-x-transition-enter-active,
.slide-x-transition-leave-active {
  transition: all 0.3s ease;
}

.slide-x-transition-enter-from {
  transform: translateX(30px);
  opacity: 0;
}

.slide-x-transition-leave-to {
  transform: translateX(-30px);
  opacity: 0;
}

</style>
