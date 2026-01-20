<template>
  <v-main class="bg-grey-lighten-4 fill-height">
    <v-container class="py-10">
      <div class="d-flex flex-column flex-sm-row justify-space-between align-start align-sm-center mb-6 ga-3">
        <h1 class="text-h4 font-weight-bold">
          <span style="font-weight: bold;" class="accent">My</span>
          <span class="ml-2 secondary font-weight-medium">Bookings</span>
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
        <h2 class="text-h5 text-grey-darken-1">No bookings yet</h2>
        <p class="text-body-1 text-grey-darken-1 mt-2">
          Your bookings will appear here once guides make offers on your requests!
        </p>
        <v-btn to="/my-trips" color="primary" class="mt-6" size="large" rounded="pill">
          View My Trips
        </v-btn>
      </div>

      <!-- Bookings List - Grouped by Request -->
      <div v-else>
        <v-expansion-panels v-model="expandedPanels" multiple>
          <v-expansion-panel
            v-for="(group, requestTitle) in groupedBookings"
            :key="requestTitle"
            class="mb-4"
          >
            <!-- Request Title Header -->
            <v-expansion-panel-title class="request-header">
              <div class="d-flex align-center">
                <v-icon icon="mdi-map-marker" class="mr-3" color="secondary"></v-icon>
                <div>
                  <h3 class="text-h6 font-weight-bold">{{ requestTitle }}</h3>
                  <span class="text-caption text-grey">{{ group.length }} booking{{ group.length > 1 ? 's' : '' }}</span>
                </div>
              </div>
            </v-expansion-panel-title>

            <!-- Bookings under this request -->
            <v-expansion-panel-text>
              <v-row>
                <v-col
                  v-for="booking in group"
                  :key="booking.booking_id"
                  cols="12"
                  class="py-2"
                >
                  <v-card class="booking-card" elevation="2">
                    <v-row no-gutters>
                      <!-- Left: Booking Info -->
                      <v-col cols="12" md="5" class="booking-info pa-6">
                        <h3 class="text-h6 font-weight-bold mb-4">
                          <v-icon icon="mdi-calendar-check" class="mr-2" color="secondary"></v-icon>
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
                          <strong>You Confirmed:</strong>
                          <span class="ml-2">{{ booking.traveller_confirmed ? 'Yes' : 'No' }}</span>
                        </div>

                        <div class="info-row mt-2" v-if="booking.agreed">
                          <v-icon icon="mdi-handshake" size="small" class="mr-2" color="success"></v-icon>
                          <strong>Agreed:</strong>
                          <span class="ml-2 success--text">Yes</span>
                        </div>

                        <!-- Accept/Decline Buttons (only for pending bookings) -->
                        <div v-if="booking.status === 'pending'" class="mt-4">
                          <v-row no-gutters>
                            <v-col cols="6" class="pr-1">
                              <v-btn
                                block
                                color="success"
                                prepend-icon="mdi-check"
                                @click="acceptBooking(booking.booking_id)"
                                :loading="booking.loading"
                              >
                                Accept
                              </v-btn>
                            </v-col>
                            <v-col cols="6" class="pl-1">
                              <v-btn
                                block
                                color="error"
                                prepend-icon="mdi-close"
                                @click="declineBooking(booking.booking_id)"
                                :loading="booking.loading"
                              >
                                Decline
                              </v-btn>
                            </v-col>
                          </v-row>
                        </div>
                      </v-col>

                      <!-- Divider -->
                      <v-divider vertical class="d-none d-md-block"></v-divider>
                      <v-divider class="d-md-none"></v-divider>

                      <!-- Right: Guide Card -->
                      <v-col cols="12" md="7" class="pa-4">
                        <h3 class="text-h6 font-weight-bold mb-4 px-2">
                          <v-icon icon="mdi-account-tie" class="mr-2" color="secondary"></v-icon>
                          Your Guide
                        </h3>
                        <GuideCard :guide="formatGuideData(booking)" />
                        
                        <!-- Review Button (only for completed bookings) -->
                        <div v-if="booking.status === 'completed'" class="mt-4 px-2">
                          <v-btn
                            block
                            variant="outlined"
                            prepend-icon="mdi-star"
                            :disabled="reviewStatus[booking.booking_id]?.hasReviewed"
                            @click="navigateToReview(booking)"
                            :loading="reviewStatus[booking.booking_id]?.loading"
                          >
                            {{ reviewStatus[booking.booking_id]?.hasReviewed ? 'Review Submitted' : 'Write a Review' }}
                          </v-btn>
                        </div>
                      </v-col>
                    </v-row>
                  </v-card>
                </v-col>
              </v-row>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </div>
    </v-container>

    <!-- Confirmation Dialog -->
    <v-dialog v-model="confirmDialog.show" max-width="500">
      <v-card>
        <v-card-title class="text-h5 d-flex align-center">
          <v-icon :icon="confirmDialog.icon" :color="confirmDialog.color" class="mr-3" size="large"></v-icon>
          {{ confirmDialog.title }}
        </v-card-title>
        <v-card-text class="text-body-1 py-4">
          {{ confirmDialog.message }}
        </v-card-text>
        <v-card-actions class="px-6 pb-4">
          <v-spacer></v-spacer>
          <v-btn
            variant="text"
            @click="confirmDialog.show = false"
          >
            Cancel
          </v-btn>
          <v-btn
            :color="confirmDialog.color"
            variant="elevated"
            @click="confirmDialog.onConfirm"
          >
            {{ confirmDialog.confirmText }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Message Dialog (for errors/success) -->
    <v-dialog v-model="messageDialog.show" max-width="500">
      <v-card>
        <v-card-title class="text-h5 d-flex align-center">
          <v-icon :icon="messageDialog.icon" :color="messageDialog.color" class="mr-3" size="large"></v-icon>
          {{ messageDialog.title }}
        </v-card-title>
        <v-card-text class="text-body-1 py-4">
          {{ messageDialog.message }}
        </v-card-text>
        <v-card-actions class="px-6 pb-4">
          <v-spacer></v-spacer>
          <v-btn
            :color="messageDialog.color"
            variant="elevated"
            @click="messageDialog.show = false"
          >
            OK
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import GuideCard from '@/components/GuideCard.vue'

const router = useRouter()
const bookings = ref([])
const loading = ref(true)
const selectedFilter = ref('all')
const expandedPanels = ref([]) // Track which panels are expanded
const reviewStatus = ref({}) // Track review status for each booking

// Dialog states
const confirmDialog = ref({
  show: false,
  title: '',
  message: '',
  icon: 'mdi-help-circle',
  color: 'primary',
  confirmText: 'OK',
  onConfirm: () => {}
})

const messageDialog = ref({
  show: false,
  title: '',
  message: '',
  icon: 'mdi-information',
  color: 'primary'
})

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

// Group bookings by request title
const groupedBookings = computed(() => {
  const groups = {}
  
  filteredBookings.value.forEach(booking => {
    const title = booking.request_title || 'Untitled Trip'
    if (!groups[title]) {
      groups[title] = []
    }
    groups[title].push(booking)
  })
  
  return groups
})

onMounted(async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      loading.value = false;
      return;
    }

    const res = await axios.get('http://localhost:3000/api/bookings/my-bookings', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    bookings.value = res.data;
    console.log('Bookings:', bookings.value);
    
    // Load review status for all completed bookings
    await loadReviewStatuses();
  } catch (err) {
    console.error("Error fetching bookings:", err);
  } finally {
    loading.value = false;
  }
})

// Load review status for all completed bookings
async function loadReviewStatuses() {
  const token = localStorage.getItem("token");
  if (!token) return;

  const completedBookings = bookings.value.filter(b => b.status === 'completed');
  
  for (const booking of completedBookings) {
    reviewStatus.value[booking.booking_id] = { loading: true, hasReviewed: false };
    
    try {
      const res = await axios.get(`http://localhost:3000/api/reviews/check/${booking.booking_id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = res.data;
      reviewStatus.value[booking.booking_id] = {
        loading: false,
        hasReviewed: data.hasReviewed,
        canReview: data.canReview,
        review: data.review
      };
    } catch (err) {
      console.error(`Error checking review status for booking ${booking.booking_id}:`, err);
      reviewStatus.value[booking.booking_id] = { loading: false, hasReviewed: false };
    }
  }
}

// Navigate to guide profile with review flag
function navigateToReview(booking) {
  router.push({
    name: 'GuideProfile',
    params: { id: booking.guide_id },
    query: { 
      writeReview: 'true', 
      bookingId: booking.booking_id 
    }
  });
}

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

// Format booking data to match GuideCard expected format
function formatGuideData(booking) {
  return {
    guide_id: booking.guide_id,
    name: booking.guide_name,
    email: booking.guide_email,
    img_url: booking.guide_img_url,
    bio: booking.guide_bio,
    city: booking.guide_city,
    country: booking.guide_country,
    rating_avg: booking.rating_avg || 0,
    languages: booking.languages || [],
    interests: booking.guide_interests || [],
    price_per_hour: booking.price_per_hour // Use guide's actual price from their profile
  };
}

// Accept a booking offer
async function acceptBooking(bookingId) {
  const booking = bookings.value.find(b => b.booking_id === bookingId);
  if (!booking) return;

  booking.loading = true;

  try {
    const token = localStorage.getItem('token');
    const response = await axios.patch(`http://localhost:3000/api/bookings/${bookingId}/accept`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const updatedBooking = response.data;
    
    // Update local booking data
    Object.assign(booking, updatedBooking);
    
    console.log('Booking accepted:', updatedBooking);
    
    // Show success message
    messageDialog.value = {
      show: true,
      title: 'Success!',
      message: 'Booking accepted successfully.',
      icon: 'mdi-check-circle',
      color: 'success'
    };
  } catch (error) {
    console.error('Error accepting booking:', error);
    
    // Show error message
    messageDialog.value = {
      show: true,
      title: 'Error',
      message: error.response?.data?.error || 'Failed to accept booking. Please try again.',
      icon: 'mdi-alert-circle',
      color: 'error'
    };
  } finally {
    booking.loading = false;
  }
}

// Decline a booking offer
async function declineBooking(bookingId) {
  const booking = bookings.value.find(b => b.booking_id === bookingId);
  if (!booking) return;

  // Show confirmation dialog
  confirmDialog.value = {
    show: true,
    title: 'Decline Booking Offer',
    message: 'Are you sure you want to decline this booking offer? This action cannot be undone.',
    icon: 'mdi-alert-circle',
    color: 'error',
    confirmText: 'Decline',
    onConfirm: () => {
      confirmDialog.value.show = false;
      performDecline(bookingId);
    }
  };
}

// Actually perform the decline action
async function performDecline(bookingId) {
  const booking = bookings.value.find(b => b.booking_id === bookingId);
  if (!booking) return;

  booking.loading = true;

  try {
    const token = localStorage.getItem('token');
    const response = await axios.patch(`http://localhost:3000/api/bookings/${bookingId}/decline`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const updatedBooking = response.data;
    
    // Update local booking data
    Object.assign(booking, updatedBooking);
    
    console.log('Booking declined:', updatedBooking);
    
    // Show success message
    messageDialog.value = {
      show: true,
      title: 'Booking Declined',
      message: 'The booking offer has been declined.',
      icon: 'mdi-information',
      color: 'info'
    };
  } catch (error) {
    console.error('Error declining booking:', error);
    
    // Show error message
    messageDialog.value = {
      show: true,
      title: 'Error',
      message: error.response?.data?.error || 'Failed to decline booking. Please try again.',
      icon: 'mdi-alert-circle',
      color: 'error'
    };
  } finally {
    booking.loading = false;
  }
}
</script>

<style scoped>
.request-header {
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 4px 0;
}

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
