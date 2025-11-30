<template>
  <v-snackbar
    v-model="internalValue"
    :color="color"
    :timeout="timeout"
    location="top"
    rounded="pill"
  >
    <div class="d-flex align-center justify-center">
      <v-icon :icon="icon" class="mr-2"></v-icon>
      <span class="text-subtitle-1 font-weight-medium">{{ message }}</span>
    </div>
  </v-snackbar>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  timeout: {
    type: Number,
    default: 2000,
  },
  color: {
    type: String,
    default: 'success',
  },
  icon: {
    type: String,
    default: 'mdi-check-circle',
  },
});

const emit = defineEmits(['update:modelValue']);

const internalValue = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});
</script>
