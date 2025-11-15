<template>
  <v-container
    class="d-flex align-center justify-center fill-height"
    fluid
  >
  
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

      <v-form ref="form" @submit.prevent="handleRegister" >

        <v-text-field
          v-model="name"
          label="Name"
          variant="outlined"
          density="comfortable"
          class="mb-4"
          bg-color="#f3f3f3"
          :rules="[rules.required]"
        />

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
          class="mb-4"
          bg-color="#f3f3f3"
          :rules="[rules.required]"
        />

        <v-text-field
          v-model="passwordConfirm"
          label="Confirm Password"
          type="password"
          variant="outlined"
          density="comfortable"
          class="mb-4"
          bg-color="#f3f3f3"
          :rules="[rules.required, rules.matchPassword]"
        />

        <v-select
          v-model="role"
          label="Role"
          :items="['Traveller', 'Guide']"
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
          Create Account
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
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useNavStore } from '@/stores/navStore'


const navStore = useNavStore()
const router = useRouter();
const name = ref("");
const email = ref("");
const password = ref("");
const passwordConfirm = ref("");
const role = ref("");
const form = ref(null)

const rules = {
  required: v => !!v || "This field is required",
  matchPassword: v => v === password.value || "Passwords must match"
};

const valid = computed(() => {
  return (
    rules.required(name.value) === true &&
    rules.required(email.value) === true &&
    rules.required(password.value) === true &&
    rules.matchPassword(passwordConfirm.value) === true
  );
});


const handleRegister = async () => {
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
        role: role.value === "Traveller" ? 0 : 1
      })
    })
    const data = await res.json();

    if (res.ok) {
      console.log("User registered:", data.user);
      console.log("Token:", data.token);
      // Save token for logged-in state
      localStorage.setItem("token", data.token);

      // 🔥 Convert numeric role → string
      const roleString = data.user.role === 1 ? "guide" : "traveller";

      // 🔥 Update Pinia
      navStore.setRole(roleString);
      
      router.push("/");        // ⬅ Redirect to HomeView
    } else {
      alert(data.error);
    }
  } catch (err) {
    console.error(err);
  }
}

</script>

<style scoped>
.v-text-field .v-field,
.v-select .v-field {
  border-radius: 12px !important;
}
</style>
