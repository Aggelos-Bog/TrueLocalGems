<template>
  <v-container class="d-flex align-center justify-center fill-height" fluid>
    <v-card
      width="500"
      class="pa-8 my-16 rounded-xl text-center"
      elevation="2"
      color="white"
      style="border: 1px solid #e5e5e5"
    >
      <v-icon
        color="#8d0040"
        size="64"
        class="mb-4"
      >
        mdi-email-check-outline
      </v-icon>
      
      <h2 class="text-h4 font-weight-medium mb-4" style="color:#333;">
        Check Your Email
      </h2>
      
      <p class="text-body-1 mb-6" style="color:#666;">
        We've sent a verification link to your email address.<br>
        Please click the link to verify your account and log in.
      </p>

      <v-btn
        to="/login"
        variant="outlined"
        color="#8d0040"
        height="44"
        class="rounded-lg px-8"
      >
        Back to Login
      </v-btn>
    </v-card>
  </v-container>
</template>

<script setup>
</script>

<style scoped>
</style>
