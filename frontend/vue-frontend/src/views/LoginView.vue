<template>
  <NavBar />
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
          type="password"
          variant="outlined"
          density="comfortable"
          class="mb-6"
          bg-color="#f3f3f3"
          :rules="[rules.required]"
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

<script>
import NavBar from '@/components/NavBar.vue';

export default {
  name: "LoginView",

  data() {
    return {
      valid: false,
      email: "",
      password: "",
      rules: {
        required: v => !!v || "This field is required",
      },
    }
  },

  methods: {
    handleLogin() {
      if (this.valid) {
        console.log("Logging in:", this.email)
      }
    },
  },
}
</script>

<style scoped>
/* Adds screenshot-like softness */
.v-text-field .v-field {
  border-radius: 12px !important;
}
</style>
