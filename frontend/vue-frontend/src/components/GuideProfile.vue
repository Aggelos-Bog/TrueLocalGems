<template>
  <!-- Spacer for app bar -->
  <div style="height: 80px;"></div>

  <v-container fluid style="width: 80%; margin-top: 20px;">
    
    <v-row>

      <!-- LEFT COLUMN -->
      <v-col cols="12" md="4">
        <v-card elevation="4" rounded="xl" class="pa-4 card-hover" style="height: 250px;">
          <v-row class="fill-height">

            <!-- LEFT SIDE -->
            <v-col cols="6" class="d-flex flex-column align-center justify-center">
              <v-avatar v-if="!isEditing" size="80" class="mb-2">
                <v-img :src="guide?.img_url" />
              </v-avatar>
              <div v-else class="flex justify-center col-span-3 mb-4">
                <PhotoForUser 
                  v-model="editForm.img_url" 
                  :initial-image="guide?.img_url"
                  :upload-url="`http://localhost:3000/guides/${guideId}/photo`"
                />
              </div>

              <div v-if="!isEditing" class="text-subtitle-1 font-weight-medium">
                {{ guide?.user_name || "Unknown" }}
              </div>
              <v-text-field
                  v-else
                  v-model="editForm.user_name"
                  label="name"
                  style="width: 7.5rem;"
                  variant="solo"
                  rounded="lg"
                  density="compact"
                  bg-color="white"
                  hide-details
                ></v-text-field>

              <div v-if="!isEditing" class="text-caption text-medium-emphasis">Local guide</div>
            </v-col>

            <v-divider vertical class="my-auto" style="height: 70%;"></v-divider>

            <!-- RIGHT SIDE -->
            <v-col cols="6" class="d-flex flex-column justify-center pl-4">

              <div class="mb-3">
                <div class="text-subtitle-1 font-weight-bold">
                  {{ guide?.reviews_count || 0 }}
                </div>
                <div class="text-caption text-medium-emphasis">Reviews</div>
              </div>

              <v-divider style="height: 80%;"></v-divider>

              <div class="mb-3">
                <v-rating
                  :model-value="Number(guide?.rating_avg)"
                  length="5"
                  size="16"
                  color="amber"
                  density="compact"
                  readonly
                ></v-rating>

                <div class="text-caption text-medium-emphasis">Rating</div>
              </div>

              <v-divider style="height: 80%;"></v-divider>

              <div>
                <div v-if="!isEditing">
                  {{ guide?.price_per_hour }} €/h
                </div>

                <v-text-field
                  v-else
                  v-model="editForm.price_per_hour"
                  type="number"
                  label="Price per hour"
                  variant="solo"
                  rounded="lg"
                  density="compact"
                  bg-color="white"
                  hide-details
                ></v-text-field>
              </div>

            </v-col>
          </v-row>
        </v-card>
      </v-col>

      <!-- RIGHT COLUMN -->
      <v-col cols="12" md="8">
        <v-card elevation="4" rounded="xl" class="pa-8 card-hover">

          <div class="d-flex justify-space-between align-center mb-4">
            <div class="text-h6">About me</div>
            
            <div class="d-flex align-center">
              <!-- Public/Private Status Indicator (Read-only) -->
              <v-chip
                v-if="canEdit && !isEditing"
                :color="guide?.public_enable ? 'success' : 'grey'"
                size="small"
                class="mr-2"
                variant="flat"
              >
                {{ guide?.public_enable ? 'Public' : 'Private' }}
              </v-chip>

               <!-- Public Toggle (Edit Mode) -->
               <v-switch
                v-if="isEditing"
                v-model="editForm.public_enable"
                :label="editForm.public_enable ? 'Public' : 'Private'"
                color="success"
                hide-details
                density="compact"
                class="mr-4"
                inset
              ></v-switch>

              <v-icon v-if="canEdit" @click="toggleEdit">
                {{ isEditing ? 'mdi-check' : 'mdi-pencil' }}
              </v-icon>
            </div>

          </div>

          <div class="my-2">
            <strong v-if="!isEditing">Language: </strong>

            <template v-if="!isEditing">
              {{ guide?.languages?.join(', ') }}
            </template>

            <v-autocomplete
              v-else
              v-model="editForm.languages"
              label="Languages"
              :items="languageOptions"
              variant="solo"
              rounded="lg"
              density="comfortable"
              bg-color="white"
              multiple
              chips
              clearable
              closable-chips
            ></v-autocomplete>

          </div>


          <div class="my-2">
            <strong v-if="!isEditing">From: </strong>

            <template v-if="!isEditing">
              {{ guide?.city }}, {{ guide?.country }}
            </template>

            <template v-else>
              <v-row>
                <v-col cols="6">
                  <v-autocomplete
                    v-model="editForm.city"
                    label="City"
                    :items="cityOptions"
                    :disabled="isCityDisabled"
                    variant="solo"
                    rounded="lg"
                    density="comfortable"
                    bg-color="white"
                    clearable
                  ></v-autocomplete>

                </v-col>
                <v-col cols="6">
                  <v-autocomplete
                    v-model="editForm.country"
                    label="Country"
                    variant="solo"
                    rounded="lg"
                    density="comfortable"
                    bg-color="white"
                    :items="countries.map(c => c.name)"
                    clearable
                  ></v-autocomplete>

                </v-col>
              </v-row>
            </template>
          </div>


          <p class="my-4" style="white-space: pre-line;" v-if="!isEditing">
            {{ guide?.bio }}
          </p>

          <v-textarea
            v-else
            v-model="editForm.bio"
            label="Biography"
            rows="6"
            variant="solo"
            rounded="lg"
            bg-color="white"
          ></v-textarea>


          <div class="my-2">
            <strong v-if="!isEditing">Interests:</strong>
          </div>

          <div v-if="!isEditing">
            {{ guide?.interests?.join(" | ") }}
          </div>

          <v-combobox
            v-else
            v-model="editForm.interests"
            label="Interests"
            multiple
            chips
            closable-chips
            clearable
            hide-selected
            variant="solo"
            rounded="lg"
            density="comfortable"
            bg-color="white"
          ></v-combobox>



        </v-card>
      </v-col>

    </v-row>

    <v-divider style="width: 100%;" class="my-10"></v-divider>

    <!-- Review Form (only shown when writeReview query param is present) -->
    <v-row v-if="showReviewForm" class="mb-8">
      <v-col cols="12" md="8">
        <v-card elevation="4" rounded="xl" class="pa-6 card-hover">
          <div class="d-flex align-center mb-4">
            <v-icon icon="mdi-star-outline" size="large" color="secondary" class="mr-3"></v-icon>
            <div class="text-h6 font-weight-bold">Write a Review</div>
          </div>

          <v-alert v-if="reviewFormMessage" :type="reviewFormMessage.type" class="mb-4">
            {{ reviewFormMessage.text }}
          </v-alert>

          <div class="mb-4">
            <div class="text-subtitle-2 mb-2">Your Rating</div>
            <v-rating
              v-model="reviewForm.rating"
              length="5"
              size="32"
              color="amber"
              active-color="amber"
              hover
            ></v-rating>
          </div>

          <v-textarea
            v-model="reviewForm.reviewText"
            label="Your Review (optional)"
            rows="4"
            variant="outlined"
            rounded="lg"
            placeholder="Share your experience with this guide..."
          ></v-textarea>

          <div class="d-flex justify-end gap-2">
            <v-btn
              variant="text"
              @click="cancelReview"
              :disabled="reviewForm.submitting"
            >
              Cancel
            </v-btn>
            <v-btn
              color="primary"
              @click="submitReview"
              :loading="reviewForm.submitting"
              :disabled="!reviewForm.rating"
            >
              Submit Review
            </v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <div class="d-flex align-center mb-6">
        <div class="text-h6 font-weight-bold">Reviews</div>
        <v-chip v-if="reviews.length > 0" class="ml-3" size="small">{{ reviews.length }}</v-chip>
    </div>

    <!-- Loading State -->
    <div v-if="reviewsLoading" class="d-flex justify-center my-8">
      <v-progress-circular indeterminate color="primary" size="48"></v-progress-circular>
    </div>

    <!-- Empty State -->
    <div v-else-if="reviews.length === 0" class="text-center my-8">
      <v-icon icon="mdi-comment-text-outline" size="64" color="grey-lighten-1" class="mb-3"></v-icon>
      <div class="text-h6 text-grey">No reviews yet</div>
      <p class="text-body-2 text-grey mt-2">Be the first to review this guide!</p>
    </div>

    <!-- Reviews List -->
    <v-row v-else>
        <v-col cols="12" md="8">
            <v-card
              v-for="review in reviews"
              :key="review.review_id"
              elevation="2"
              rounded="xl"
              class="pa-4 mb-4 review-card card-hover"
            >
                <v-row>
                    <!-- LEFT SIDE: Avatar + user info -->
                    <v-col cols="12" md="3" class="d-flex flex-column align-center">
                      <v-avatar size="70" class="mb-2" color="secondary">
                        <span class="text-h6">{{ getInitials(review.reviewer_name) }}</span>
                      </v-avatar>

                      <div class="text-subtitle-2 font-weight-bold">{{ review.reviewer_name }}</div>
                      <div class="text-caption text-medium-emphasis mb-1">as a traveller</div>

                      <div class="text-caption text-medium-emphasis">
                          {{ formatReviewDate(review.created_at) }}
                      </div>
                    </v-col>

                    <!-- RIGHT SIDE: Review text + stars -->
                    <v-col cols="12" md="9">
                      <v-rating
                        :model-value="Number(review.rating)"
                        length="5"
                        size="20"
                        color="amber"
                        density="compact"
                        readonly
                        class="mb-3"
                      ></v-rating>
                    
                      <div v-if="review.review_text" class="text-body-2" style="line-height: 1.4;">
                        {{ review.review_text }}
                      </div>
                      <div v-else class="text-body-2 text-grey font-italic">
                        No written review provided.
                      </div>
                    </v-col>
                </v-row>
            </v-card>
        </v-col>
    </v-row>

  </v-container>
</template>

<script setup>
  import { ref, onMounted, watch, computed } from "vue";
  import { useRoute, useRouter } from "vue-router";
  import { useCityStore } from "@/stores/useCityStore";
  import { useNavStore } from "@/stores/navStore";
  import PhotoForUser from "@/components/PhotoForUser.vue"
  import axios from 'axios';



  const navStore = useNavStore();
  const cityStore = useCityStore();
  const languageOptions = ref([]);
  const countries = ref([]);
  const cityOptions = ref([]);
  const isCityDisabled = ref(true);



  const route = useRoute();
  const guideId = computed(() => route.params.id);

  const guide = ref(null);
  const loading = ref(true);
  const error = ref(null);

  const isEditing = ref(false);
  const editForm = ref({});

  // Review-related state
  const router = useRouter();
  const reviews = ref([]);
  const reviewsLoading = ref(false);
  const showReviewForm = ref(false);
  const reviewForm = ref({
    rating: 0,
    reviewText: '',
    submitting: false
  });
  const reviewFormMessage = ref(null);

  const canEdit = computed(() => {
    return Number(navStore.userId) === Number(guideId.value);
  });

  // Watch for route changes to reload data
  watch(guideId, (newId) => {
    if (newId) {
      loadGuide();
      loadReviews();
      checkReviewFormVisibility();
      // Reset edit mode if we navigate away
      isEditing.value = false;
    }
  });

  watch(() => editForm.value.country, (selectedName) => {
   if (!selectedName) {
      isCityDisabled.value = true;
      editForm.value.city = null;
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


  async function toggleEdit() {
    // ENTER EDIT MODE
    if (!isEditing.value) {
      editForm.value = JSON.parse(JSON.stringify(guide.value));

      // Load dropdown data before showing edit fields
      await loadLanguages();
      await loadCountries();

      // Preload city list
      const selectedCountry = countries.value.find(c => c.name === guide.value.country);

      if (selectedCountry) {
        cityOptions.value = cityStore.getCitiesByIso(selectedCountry.code);
        isCityDisabled.value = false;
      }

      isEditing.value = true;
      return;
    }


    // LEAVING EDIT MODE → SAVE TO BACKEND
    try {
      const payload = {
        ...editForm.value,
        // Ensure strings converted to arrays for DB
        languages: typeof editForm.value.languages === "string"
          ? editForm.value.languages.split(",").map(s => s.trim())
          : editForm.value.languages,

        interests: typeof editForm.value.interests === "string"
          ? editForm.value.interests.split(",").map(s => s.trim())
          : editForm.value.interests
      };

      const res = await axios.put(`http://localhost:3000/guides/${guideId.value}`, payload, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });

      const updatedGuide = res.data;

      // Update UI
      guide.value = updatedGuide;

      console.log("Guide updated successfully");
    } catch (err) {
      console.error("Update failed:", err);
    }

    isEditing.value = false;
  }


  async function loadGuide() {
    try {
      const res = await axios.get(`http://localhost:3000/guides/${guideId.value}`);
      guide.value = res.data;
      
      // Load reviews after guide data is loaded successfully
      await loadReviews();
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  }

  const loadLanguages = async () => {
    try {
      const res = await axios.get("https://api.languagetoolplus.com/v2/languages");
      const data = res.data;

      const names = data.map(l => l.name);
      const uniqueNames = [...new Set(names)];

      languageOptions.value = uniqueNames;
    } catch (err) {
      console.error("Failed to load languages:", err);
    }
  };

  const loadCountries = async () => {
    try {
      const res = await axios.get(
        'https://restcountries.com/v3.1/region/europe?fields=name,cca2'
      );
      const data = res.data;

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


  // Load reviews from backend
  async function loadReviews() {
    console.log('loadReviews() called, guideId:', guideId.value);
    
    // Guard: Don't load if guideId is not available yet
    if (!guideId.value) {
      console.log('Skipping loadReviews - guideId not available yet');
      return;
    }
    
    reviewsLoading.value = true;
    try {
      const res = await axios.get(`http://localhost:3000/api/reviews/guide/${guideId.value}`);
      console.log('Reviews API response status:', res.status);
      const data = res.data;
      console.log('Reviews data:', data);
      reviews.value = data;
    } catch (err) {
      console.error('Error loading reviews:', err);
    } finally {
      reviewsLoading.value = false;
    }
  }

  // Check if review form should be shown
  async function checkReviewFormVisibility() {
    const { writeReview, bookingId } = route.query;
    
    if (writeReview === 'true' && bookingId) {
      const token = localStorage.getItem('token');
      if (!token) {
        showReviewForm.value = false;
        return;
      }

      try {
        const res = await axios.get(`http://localhost:3000/api/reviews/check/${bookingId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = res.data;
        // Only show form if user can review and hasn't reviewed yet
        showReviewForm.value = data.canReview && !data.hasReviewed;
        
        if (data.hasReviewed) {
          reviewFormMessage.value = {
            type: 'info',
            text: 'You have already submitted a review for this booking.'
          };
        }
      } catch (err) {
        console.error('Error checking review eligibility:', err);
        showReviewForm.value = false;
      }
    } else {
      showReviewForm.value = false;
    }
  }

  // Submit review
  async function submitReview() {
    const { bookingId } = route.query;
    if (!bookingId) return;

    reviewForm.value.submitting = true;
    reviewFormMessage.value = null;

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:3000/api/reviews', {
        booking_id: Number(bookingId),
        rating: reviewForm.value.rating,
        review_text: reviewForm.value.reviewText || null
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      reviewFormMessage.value = {
        type: 'success',
        text: 'Thank you! Your review has been submitted successfully.'
      };
      
      // Reset form
      reviewForm.value.rating = 0;
      reviewForm.value.reviewText = '';
      
      // Reload guide data to update rating_avg
      await loadGuide();
      await loadReviews();
      
      // Hide form after a delay
      setTimeout(() => {
        showReviewForm.value = false;
        // Clear query params
        router.replace({ name: 'GuideProfile', params: { id: guideId.value } });
      }, 2000);
    } catch (err) {
      console.error('Error submitting review:', err);
      reviewFormMessage.value = {
        type: 'error',
        text: err.response?.data?.error || 'An error occurred. Please try again.'
      };
    } finally {
      reviewForm.value.submitting = false;
    }
  }

  // Cancel review
  function cancelReview() {
    showReviewForm.value = false;
    reviewForm.value.rating = 0;
    reviewForm.value.reviewText = '';
    reviewFormMessage.value = null;
    // Clear query params
    router.replace({ name: 'GuideProfile', params: { id: guideId.value } });
  }

  // Get initials for avatar
  function getInitials(name) {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  // Format review date
  function formatReviewDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    });
  }

  onMounted(() => {
    loadGuide(); // This will also call loadReviews internally
    checkReviewFormVisibility();
  });
</script>




<style scoped>
.card-hover {
  transition: box-shadow 0.25s ease, transform 0.2s ease;
}

.card-hover:hover {
  box-shadow: 0px 6px 20px rgba(0, 0, 0, 0.35) !important;
  transform: translateY(-1px); /* optional, gives a nice lift */
}
</style>
