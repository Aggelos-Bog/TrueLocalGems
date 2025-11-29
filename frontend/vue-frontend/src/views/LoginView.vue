<template>
  <v-container
    class="d-flex align-center justify-center fill-height"
    fluid
  >
    <v-card
      width="420"
      class="pa-8 rounded-xl"
      elevation="2"
      color="white"
      style="border: 1px solid #e5e5e5"
    >
      <div class="text-center mb-6">
        <h2 class="text-h4 font-weight-medium" style="color:#333;">
          Login
        </h2>
      </div>

      <v-form @submit.prevent="handleLogin" v-model="valid">

        <v-text-field
          v-model="email"
          label="Email"
          type="email"
          variant="outlined"
          density="comfortable"
          class="mb-4"
          bg-color="#f3f3f3"
          :rules="[rules.required]"
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

        <v-btn
          type="submit"
          block
          height="44"
          class="rounded-lg"
          color="#8d0040"
          variant="flat"
        >
          Sign In
        </v-btn>

      </v-form>

      <p class="text-center mt-4" style="color:#666;">
        Don’t have an account?
        <router-link to="/register" style="color:#e3257b; text-decoration: underline;">
          Register
        </router-link>
      </p>
    </v-card>
  </v-container>
</template>

<script setup>
  import { ref, computed } from "vue";
  import { useRouter } from "vue-router";
  import { useNavStore } from '@/stores/navStore'

  const navStore = useNavStore()
  const router = useRouter();

  const email = ref("");
  const password = ref("");
  
  const showPassword = ref(false);

  const rules = {
    required: v => !!v || "This field is required",
  };

  const valid = computed(() => {
    return (
      rules.required(email.value) === true &&
      rules.required(password.value) === true
    );
  });

const handleLogin = async () => {
  if (!valid.value) return;

  try {
    const res = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email.value,
        password: password.value
      })
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("token", data.token);
      // 🔥 Convert numeric role → string
      const roleString = data.user.role === 1 ? "guide" : "traveller";

       // 3️⃣ Load new token into store (VERY IMPORTANT 🔥)
      navStore.loadFromToken();  

      // 🔥 Update Pinia
      navStore.setRole(roleString);

      router.push("/");
    } else {
      alert(data.error);
    }
  } catch (err) {
    console.error(err);
  }
};


</script>

<style scoped>
/* Adds screenshot-like softness */
.v-text-field .v-field {
  border-radius: 12px !important;
}
</style>
