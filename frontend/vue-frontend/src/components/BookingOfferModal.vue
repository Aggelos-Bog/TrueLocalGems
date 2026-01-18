<template>
  <v-dialog v-model="dialog" max-width="500px" persistent>
    <v-card>
      <v-card-title class="d-flex align-center bg-primary text-white">
        <v-icon class="mr-2">mdi-handshake</v-icon>
        Create Booking Offer
      </v-card-title>
      
      <v-card-text class="pt-6">
        <v-form ref="formRef">
          <v-select
            v-model="offerData.date"
            :items="dateOptions"
            label="Select Date *"
            :rules="[rules.required]"
            variant="outlined"
            density="comfortable"
            class="mb-4"
            item-value="value"
            item-title="title"
          >
            <template v-slot:item="{ props, item }">
              <v-list-item 
                v-bind="props"
                :disabled="item.raw.disabled"
                :class="{ 'booked-date': item.raw.disabled }"
              >
                <template v-slot:title>
                  {{ item.raw.title }}
                  <v-chip 
                    v-if="item.raw.disabled" 
                    size="x-small" 
                    color="error" 
                    variant="flat"
                    class="ml-2"
                  >
                    Booked
                  </v-chip>
                </template>
              </v-list-item>
            </template>
          </v-select>

          <v-text-field
            v-model.number="offerData.price"
            label="Price per Hour (€) *"
            type="number"
            step="0.01"
            min="0"
            :rules="[rules.required, rules.positiveNumber]"
            variant="outlined"
            density="comfortable"
            prefix="€"
            class="mb-4"
          />

          <v-text-field
            v-model.number="offerData.hours"
            label="Duration (hours) *"
            type="number"
            min="1"
            :rules="[rules.required, rules.positiveInteger]"
            variant="outlined"
            density="comfortable"
            suffix="hours"
          />
        </v-form>

        <div v-if="offerData.price && offerData.hours" class="mt-4 pa-3 bg-grey-lighten-4 rounded">
          <div class="text-body-2 text-grey-darken-1">Total Price</div>
          <div class="text-h5 font-weight-bold text-primary">
            €{{ totalPrice }}
          </div>
        </div>
      </v-card-text>

      <v-card-actions class="px-6 pb-4">
        <v-btn
          @click="close"
          variant="text"
        >
          Cancel
        </v-btn>
        <v-spacer />
        <v-btn
          color="secondary"
          variant="flat"
          @click="sendOffer"
          :loading="loading"
        >
          Send Offer
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  requestDateFrom: {
    type: String,
    required: true,
  },
  requestDateTo: {
    type: String,
    required: true,
  },
  requestId: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits(['update:modelValue', 'submit']);

const dialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const formRef = ref(null);
const loading = ref(false);
const bookedDates = ref([]);

const offerData = ref({
  date: null,
  price: null,
  hours: null,
});

// Fetch booked dates from backend
const fetchBookedDates = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:3000/api/bookings/booked-dates?request_id=${props.requestId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      bookedDates.value = data.bookedDates || [];
    }
  } catch (error) {
    console.error('Error fetching booked dates:', error);
  }
};

// Generate date options between request date_from and date_to
const dateOptions = computed(() => {
  const options = [];
  const start = new Date(props.requestDateFrom);
  const end = new Date(props.requestDateTo);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset to start of day for comparison
  
  let current = new Date(start);
  while (current <= end) {
    const dateStr = current.toISOString().split('T')[0];
    const isBooked = bookedDates.value.includes(dateStr);
    const isPast = current < today;
    
    // Only include dates that are today or in the future
    if (!isPast) {
      options.push({
        value: dateStr,
        title: new Date(dateStr).toLocaleDateString('en-US', {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }),
        disabled: isBooked,
      });
    }
    current.setDate(current.getDate() + 1);
  }
  
  return options;
});

const totalPrice = computed(() => {
  if (offerData.value.price && offerData.value.hours) {
    return (offerData.value.price * offerData.value.hours).toFixed(2);
  }
  return '0.00';
});

const rules = {
  required: value => !!value || 'This field is required',
  positiveNumber: value => value > 0 || 'Must be greater than 0',
  positiveInteger: value => (value > 0 && Number.isInteger(value)) || 'Must be a positive integer',
};

const sendOffer = async () => {
  const { valid } = await formRef.value.validate();
  
  if (!valid) return;
  
  loading.value = true;
  
  try {
    emit('submit', { ...offerData.value });
    // Reset form
    offerData.value = {
      date: null,
      price: null,
      hours: null,
    };
    formRef.value.reset();
  } finally {
    loading.value = false;
  }
};

const close = () => {
  dialog.value = false;
  offerData.value = {
    date: null,
    price: null,
    hours: null,
  };
  formRef.value?.reset();
};

// Reset form and fetch booked dates when dialog opens
watch(dialog, async (newVal) => {
  if (newVal) {
    offerData.value = {
      date: null,
      price: null,
      hours: null,
    };
    formRef.value?.reset();
    await fetchBookedDates();
  }
});

// Fetch booked dates on mount
onMounted(() => {
  fetchBookedDates();
});
</script>

<style scoped>
/* Style for booked dates */
.booked-date {
  opacity: 0.5;
}
</style>
