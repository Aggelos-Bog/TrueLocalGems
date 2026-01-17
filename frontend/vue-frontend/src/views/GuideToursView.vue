<template>
  <v-main class="bg-grey-lighten-4 fill-height">
    <v-container class="py-10">
      <div class="d-flex justify-space-between align-center mb-6">
        <h1 class="text-h4 font-weight-bold">
          <span style="font-weight: bold;" class="accent">My</span>
          <span class="ml-2 secondary font-weight-medium">Tours</span>
        </h1>

        <!-- Filter Dropdown -->
        <v-menu offset-y>
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              variant="outlined"
              prepend-icon="mdi-filter-variant"
              rounded="pill"
            >
              {{ selectedFilter === 'all' ? 'All Bookings' : formatStatus(selectedFilter) }}
              <v-icon class="ml-1">mdi-chevron-down</v-icon>
            </v-btn>
          </template>
          <v-list>
            <v-list-item
              v-for="filter in filterOptions"
              :key="filter.value"
              @click="selectedFilter = filter.value"
              :active="selectedFilter === filter.value"
            >
              <template v-slot:prepend>
                <v-icon :color="filter.color">{{ filter.icon }}</v-icon>
              </template>
              <v-list-item-title>{{ filter.label }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="d-flex justify-center mt-10">
        <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
      </div>

      <!-- Empty State -->
      <div v-else-if="bookings.length === 0" class="text-center mt-10">
        <v-icon icon="mdi-calendar-blank" size="100" color="grey-lighten-1" class="mb-4"></v-icon>
        <h2 class="text-h5 text-grey-darken-1">No tours yet</h2>
        <p class="text-body-1 text-grey-darken-1 mt-2">
          Your booking offers will appear here once you make them!
        </p>
        <v-btn to="/bookmarks" color="primary" class="mt-6" size="large" rounded="pill">
          Browse Requests
        </v-btn>
      </div>

      <!-- Bookings List -->
      <v-row v-else>
        <v-col
          v-for="booking in filteredBookings"
          :key="booking.booking_id"
          cols="12"
        >
          <v-card class="booking-card" elevation="2">
            <v-row no-gutters>
              <!-- Left: Booking Info -->
              <v-col cols="12" md="5" class="booking-info pa-6">
                <h3 class="text-h6 font-weight-bold mb-4">
                  <v-icon icon="mdi-calendar-check" class="mr-2" color="primary"></v-icon>
                  Booking Details
                </h3>

                <div class="info-row mb-3">
                  <v-icon icon="mdi-calendar" size="small" class="mr-2"></v-icon>
                  <strong>Date:</strong>
                  <span class="ml-2">{{ formatDate(booking.date) }}</span>
                </div>

                <div class="info-row mb-3">
                  <v-icon icon="mdi-clock-outline" size="small" class="mr-2"></v-icon>
                  <strong>Hours:</strong>
                  <span class="ml-2">{{ booking.hours }} hours</span>
                </div>

                <div class="info-row mb-3">
                  <v-icon icon="mdi-cash" size="small" class="mr-2"></v-icon>
                  <strong>Price:</strong>
                  <span class="ml-2">${{ booking.price }}</span>
                </div>

                <div class="info-row mb-3">
                  <v-icon icon="mdi-account" size="small" class="mr-2"></v-icon>
                  <strong>Traveler:</strong>
                  <span class="ml-2">{{ booking.traveller_name }}</span>
                </div>

                <div class="info-row mb-3">
                  <v-icon 
                    :icon="getStatusIcon(booking.status)" 
                    size="small" 
                    class="mr-2"
                    :color="getStatusColor(booking.status)"
                  ></v-icon>
                  <strong>Status:</strong>
                  <v-chip
                    :color="getStatusColor(booking.status)"
                    size="small"
                    class="ml-2"
                  >
                    {{ formatStatus(booking.status) }}
                  </v-chip>
                </div>

                <v-divider class="my-4"></v-divider>

                <div class="info-row">
                  <v-icon icon="mdi-check-circle" size="small" class="mr-2" :color="booking.guide_confirmed ? 'success' : 'grey'"></v-icon>
                  <strong>Guide Confirmed:</strong>
                  <span class="ml-2">{{ booking.guide_confirmed ? 'Yes' : 'No' }}</span>
                </div>

                <div class="info-row mt-2">
                  <v-icon icon="mdi-check-circle" size="small" class="mr-2" :color="booking.traveller_confirmed ? 'success' : 'grey'"></v-icon>
                  <strong>Traveler Confirmed:</strong>
                  <span class="ml-2">{{ booking.traveller_confirmed ? 'Yes' : 'No' }}</span>
                </div>

                <div class="info-row mt-2" v-if="booking.agreed">
                  <v-icon icon="mdi-handshake" size="small" class="mr-2" color="success"></v-icon>
                  <strong>Agreed:</strong>
                  <span class="ml-2 success--text">Yes</span>
                </div>
              </v-col>

              <!-- Divider -->
              <v-divider vertical class="d-none d-md-block"></v-divider>
              <v-divider class="d-md-none"></v-divider>

              <!-- Right: Request Card -->
              <v-col cols="12" md="7" class="pa-4">
                <h3 class="text-h6 font-weight-bold mb-4 px-2">
                  <v-icon icon="mdi-map-marker" class="mr-2" color="secondary"></v-icon>
                  Request Details
                </h3>
                <TravellerCard :request="formatRequestData(booking)" />
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import TravellerCard from '@/components/TravellerCard.vue'

const bookings = ref([])
const loading = ref(true)
const selectedFilter = ref('all')

// Filter options
const filterOptions = [
  { label: 'All Bookings', value: 'all', icon: 'mdi-format-list-bulleted', color: 'grey' },
  { label: 'Pending', value: 'pending', icon: 'mdi-clock-alert', color: 'warning' },
  { label: 'Confirmed', value: 'confirmed', icon: 'mdi-check-circle', color: 'success' },
  { label: 'Cancelled', value: 'cancelled', icon: 'mdi-cancel', color: 'error' },
  { label: 'Completed', value: 'completed', icon: 'mdi-check-all', color: 'info' },
]

// Sort bookings by date (most recent first)
const sortedBookings = computed(() => {
  return [...bookings.value].sort((a, b) => {
    return new Date(b.date) - new Date(a.date)
  })
})

// Filter bookings by selected status
const filteredBookings = computed(() => {
  if (selectedFilter.value === 'all') {
    return sortedBookings.value
  }
  return sortedBookings.value.filter(booking => booking.status === selectedFilter.value)
})

onMounted(async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      loading.value = false;
      return;
    }

    const res = await fetch('http://localhost:3000/api/bookings/my-bookings', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (res.ok) {
      bookings.value = await res.json();
      console.log('Bookings:', bookings.value);
    } else {
      console.error("Failed to fetch bookings");
    }
  } catch (err) {
    console.error("Error fetching bookings:", err);
  } finally {
    loading.value = false;
  }
})

// Format date for display
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

// Format status for display
function formatStatus(status) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

// Get status color
function getStatusColor(status) {
  const colors = {
    confirmed: 'success',
    pending: 'warning',
    cancelled: 'error',
    completed: 'info'
  };
  return colors[status] || 'grey';
}

// Get status icon
function getStatusIcon(status) {
  const icons = {
    confirmed: 'mdi-check-circle',
    pending: 'mdi-clock-alert',
    cancelled: 'mdi-cancel',
    completed: 'mdi-check-all'
  };
  return icons[status] || 'mdi-information';
}

// Format booking data to match TravellerCard expected format
function formatRequestData(booking) {
  return {
    rfg_id: booking.request_id,
    title: booking.request_title,
    city: booking.request_city,
    country: booking.request_country,
    date_from: booking.date_from,
    date_to: booking.date_to,
    description: booking.description,
    interests: booking.interests
  };
}
</script>

<style scoped>
.booking-card {
  border-radius: 12px;
  transition: all 0.3s ease;
}

.booking-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15) !important;
}

.booking-info {
  background-color: #f8f9fa;
}

.info-row {
  display: flex;
  align-items: center;
  font-size: 0.95rem;
}

.info-row strong {
  color: #424242;
}

.info-row span {
  color: #616161;
}
</style>
