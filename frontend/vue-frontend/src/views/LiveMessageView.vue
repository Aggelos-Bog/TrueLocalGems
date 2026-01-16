<template>
  <div style="height: 100vh; padding-top: 80px;">
    <v-container fluid class="pa-0" style="height: calc(100vh - 80px);">
      <v-row no-gutters style="height: 100%;">
      <!-- Left Sidebar: Contacts List -->
      <v-col 
        cols="12" 
        md="3" 
        class="border-e d-flex flex-column"
        v-show="!mobile || !selectedChat"
      >
        <!-- Sidebar Header -->
        <v-toolbar flat color="white" class="border-b">
           <v-toolbar-title class="text-h6 font-weight-bold pl-4">Messages</v-toolbar-title>
        </v-toolbar>

        <v-list v-if="!loadingChats && chats.length > 0" lines="two" class="flex-grow-1 overflow-y-auto pa-0">
          <v-list-item
            v-for="chat in chats"
            :key="chat.request_id + '-' + (chat.guide_id || chat.traveller_id)"
            :value="chat"
            :active="selectedChat?.request_id === chat.request_id && (selectedChat?.guide_id === chat.guide_id || selectedChat?.traveller_id === chat.traveller_id)"
            active-color="blue-grey-lighten-3"
            class="py-3 border-b"
            @click="selectChat(chat)"
          >
            <template v-slot:prepend>
              <v-avatar size="48" color="grey-lighten-2">
                <v-img v-if="chat.guide_avatar" :src="chat.guide_avatar" cover></v-img>
                <span v-else class="text-h6">{{ (chat.guide_name || chat.traveller_name)?.charAt(0) || '?' }}</span>
              </v-avatar>
            </template>

            <v-list-item-title class="font-weight-medium mb-1">
              {{ chat.guide_name || chat.traveller_name || 'Unknown' }}
            </v-list-item-title>
            <v-list-item-subtitle class="text-truncate">
              {{ chat.title }}
            </v-list-item-subtitle>
            
             <template v-slot:append>
                <span class="text-caption text-grey">{{ chat.city }}</span>
            </template>
          </v-list-item>
        </v-list>

        <div v-else-if="loadingChats" class="flex-grow-1 d-flex align-center justify-center">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
        </div>

        <div v-else class="flex-grow-1 d-flex align-center justify-center text-grey">
          <div class="text-center pa-4">
            <v-icon size="64" class="mb-4">mdi-message-outline</v-icon>
            <div class="text-h6">No Chats Yet</div>
            <div class="text-body-2">Start by making an offer on a request</div>
          </div>
        </div>
      </v-col>

      <!-- Right Main Area: Chat Window -->
      <v-col 
         cols="12" 
         md="9" 
         class="d-flex flex-column bg-grey-lighten-4"
         v-show="!mobile || selectedChat"
         style="height: 100%;"
      >
        
        <!-- Chat Header -->
        <v-toolbar flat color="white" class="border-b px-2" height="72">
          <template v-if="selectedChat">
            <v-btn icon class="d-md-none mr-2" @click="selectedChat = null">
               <v-icon>mdi-arrow-left</v-icon>
            </v-btn>
            <v-avatar size="40" class="mr-3" color="grey-lighten-2">
               <v-img v-if="selectedChat.counterparty_avatar" :src="selectedChat.counterparty_avatar" cover></v-img>
               <span v-else>{{ selectedChat.counterparty_name?.charAt(0) || '?' }}</span>
            </v-avatar>
            <div class="d-flex flex-column">
              <span class="text-subtitle-1 font-weight-bold">{{ selectedChat.counterparty_name || 'Unknown' }}</span>
              <span class="text-caption text-grey">{{ selectedChat.title }}</span>
            </div>
            <v-spacer></v-spacer>
          </template>
          <template v-else>
             <div class="text-subtitle-1 text-grey pl-4">Select a conversation</div>
          </template>
        </v-toolbar>

        <!-- Messages Area -->
        <div 
          v-if="selectedChat" 
          class="flex-grow-1 overflow-y-auto pa-4"
          ref="messagesContainer"
        >
          <div v-if="loadingMessages" class="d-flex justify-center align-center" style="height: 100%;">
            <v-progress-circular indeterminate color="primary"></v-progress-circular>
          </div>

          <div v-else>
            <div 
              v-for="(msg, index) in currentMessages" 
              :key="index"
            >
              <!-- Regular text message -->
              <div 
                v-if="!msg.booking_offer"
                class="d-flex mb-4"
                :class="msg.isMe ? 'justify-end' : 'justify-start'"
              >
                <!-- Avatar for other user -->
                <v-avatar 
                  v-if="!msg.isMe" 
                  size="32" 
                  class="mr-2 align-self-end mb-1"
                  color="grey-lighten-2"
                >
                  <v-img v-if="selectedChat.counterparty_avatar" :src="selectedChat.counterparty_avatar" cover></v-img>
                  <span v-else>{{ selectedChat.counterparty_name?.charAt(0) || '?' }}</span>
                </v-avatar>

                <div 
                  class="pa-3 rounded-lg text-body-2"
                  :class="msg.isMe ? 'bg-primary text-white rounded-br-0' : 'bg-white rounded-bl-0 elevation-1'"
                  style="max-width: 70%;"
                >
                  {{ msg.content }}
                </div>
              </div>

              <!-- Booking offer card -->
              <div v-else class="mb-4">
                <v-card class="mx-auto" max-width="400" elevation="3">
                  <v-card-title class="bg-primary text-white d-flex align-center">
                    <v-icon class="mr-2">mdi-handshake</v-icon>
                    Booking Offer
                  </v-card-title>
                  <v-card-text class="pt-4">
                    <v-row dense>
                      <v-col cols="6">
                        <div class="text-caption text-grey">Date</div>
                        <div class="text-body-1 font-weight-medium">{{ formatDate(msg.booking_offer.date) }}</div>
                      </v-col>
                      <v-col cols="6">
                        <div class="text-caption text-grey">Duration</div>
                        <div class="text-body-1 font-weight-medium">{{ msg.booking_offer.hours }} hours</div>
                      </v-col>
                      <v-col cols="12" class="mt-2">
                        <div class="text-caption text-grey">Price</div>
                        <div class="text-h6 font-weight-bold text-primary">
                          €{{ msg.booking_offer.price }} / hour
                        </div>
                        <div class="text-body-2 text-grey-darken-1">
                          Total: €{{ (msg.booking_offer.price * msg.booking_offer.hours).toFixed(2) }}
                        </div>
                      </v-col>
                    </v-row>
                    
                    <!-- Status Badge -->
                    <v-chip 
                      class="mt-3"
                      :color="getStatusColor(msg.booking_offer.status)"
                      variant="flat"
                      size="small"
                    >
                      {{ getStatusText(msg.booking_offer.status) }}
                    </v-chip>
                  </v-card-text>
                  
                  <!-- Action Buttons (only show for traveller if status is pending) -->
                  <v-card-actions v-if="!isGuide && msg.booking_offer.status === 'pending'" class="px-4 pb-4">
                    <v-btn 
                      color="error" 
                      variant="text"
                      @click="declineOffer(msg.booking_offer.booking_id)"
                    >
                      Decline
                    </v-btn>
                    <v-spacer />
                    <v-btn 
                      color="success" 
                      variant="flat"
                      @click="acceptOffer(msg.booking_offer.booking_id)"
                    >
                      Accept Offer
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Empty State -->
        <div v-else class="flex-grow-1 d-flex align-center justify-center text-grey">
            <div class="text-center">
                <v-icon size="64" class="mb-4">mdi-message-text-outline</v-icon>
                <div class="text-h6">Your Messages</div>
                <div class="text-body-2">Select a chat to start messaging</div>
            </div>
        </div>

        <!-- Input Area -->
        <div v-if="selectedChat" class="bg-white px-4 py-3 border-t">
          <!-- Create Booking Offer Button (guides only) -->
          <v-row no-gutters align="center" class="mb-3" v-if="isGuide">
            <v-col>
              <v-btn
                color="primary"
                variant="outlined"
                prepend-icon="mdi-handshake"
                @click="openBookingModal"
                block
              >
                Create Booking Offer
              </v-btn>
            </v-col>
          </v-row>

          <!-- Message Input -->
          <v-form @submit.prevent="sendMessage">
            <v-row no-gutters align="center">
              <v-col>
                <v-text-field
                  v-model="newMessage"
                  placeholder="Type a message..."
                  variant="solo"
                  density="default"
                  hide-details
                  bg-color="grey-lighten-4"
                  rounded="pill"
                  class="message-input"
                >
                </v-text-field>
              </v-col>
              <v-col cols="auto" class="pl-2">
                 <v-btn 
                    icon 
                    color="black" 
                    type="submit" 
                    :disabled="!newMessage.trim()"
                    size="large"
                 >
                   <v-icon size="28">mdi-send</v-icon>
                 </v-btn>
              </v-col>
            </v-row>
          </v-form>
        </div>

        <!-- Booking Offer Modal -->
        <BookingOfferModal
          v-model="bookingModalOpen"
          :request-date-from="selectedChat?.date_from || ''"
          :request-date-to="selectedChat?.date_to || ''"
          :request-id="selectedChat?.request_id || 0"
          @submit="createBookingOffer"
        />

      </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useDisplay } from 'vuetify';
import { useRoute } from 'vue-router';
import { useChat } from '@/composables/useChat';
import BookingOfferModal from '@/components/BookingOfferModal.vue';

const { mobile } = useDisplay();
const route = useRoute();
const { connect, joinRoom, sendMessage: sendSocketMessage, on, emit, onNewMessage, loadChatHistory, disconnect } = useChat();

// State
const chats = ref([]);
const selectedChat = ref(null);
const currentMessages = ref([]);
const newMessage = ref('');
const messagesContainer = ref(null);
const loadingChats = ref(true);
const loadingMessages = ref(false);
const bookingModalOpen = ref(false);

// Get token and user info from localStorage
const token = localStorage.getItem('token');
let currentUserId = null;
let currentUserRole = null;

// Decode JWT to get current user ID and role
if (token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    currentUserId = payload.id;
    currentUserRole = payload.role;
  } catch (e) {
    console.error('Failed to decode token:', e);
  }
}

// Check if current user is a guide
const isGuide = computed(() => currentUserRole === 1);

/**
 * Load all chats for current user
 */
const loadChats = async () => {
  try {
    loadingChats.value = true;
    const response = await fetch('http://localhost:3000/api/messages', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to load chats');
    }

    const data = await response.json();
    
    // Transform data to include counterparty info
    chats.value = data.map(chat => ({
      ...chat,
      counterparty_name: chat.guide_name || chat.traveller_name,
      counterparty_avatar: chat.guide_avatar || chat.traveller_avatar || null,
      counterparty_id: chat.guide_id || chat.traveller_id,
    }));

  } catch (error) {
    console.error('Error loading chats:', error);
    console.error('Error response:', error.message);
  } finally {
    loadingChats.value = false;
  }
};

/**
 * Select a chat and load its history
 */
const selectChat = async (chat) => {
  selectedChat.value = chat;
  loadingMessages.value = true;
  currentMessages.value = [];

  try {
    // Extract guide_id from chat object
    const guideId = chat.guide_id || currentUserId;
    
    // Load message history with guide_id
    const historyData = await loadChatHistory(chat.request_id, guideId, token);
    
    // Transform items (messages and booking offers)
    if (historyData && historyData.items && Array.isArray(historyData.items)) {
      currentMessages.value = historyData.items.map(item => {
        if (item.type === 'message') {
          return {
            message_id: item.data.message_id,
            content: item.data.content,
            send_at: item.data.send_at,
            isMe: item.data.sender_id === currentUserId,
          };
        } else if (item.type === 'booking_offer') {
          return {
            booking_offer: item.data,
            isMe: item.data.guide_id === currentUserId,
          };
        }
        return item;
      });
    } else {
      // Fallback for empty or invalid response
      currentMessages.value = [];
    }

    // Join WebSocket room with guide_id
    joinRoom(chat.request_id, guideId);
    
    scrollToBottom();
  } catch (error) {
    console.error('Error loading chat history:', error);
    console.error('Error details:', error.message, error.stack);
    // Set empty messages on error so chat still loads
    currentMessages.value = [];
  } finally {
    loadingMessages.value = false;
  }
};

/**
 * Send a message
 */
const sendMessage = () => {
  if (!newMessage.value.trim() || !selectedChat.value) return;

  // Extract guide_id from selected chat
  const guideId = selectedChat.value.guide_id || currentUserId;
  
  // Send via WebSocket with guide_id
  sendSocketMessage(selectedChat.value.request_id, guideId, newMessage.value.trim());
  
  newMessage.value = '';
};

/**
 * Handle incoming messages from WebSocket
 */
const handleNewMessage = async (message) => {
  // If message belongs to currently selected chat, add it to messages
  if (selectedChat.value && 
      message.chat_room_id === `request:${selectedChat.value.request_id}:guide:${selectedChat.value.guide_id || currentUserId}`) {
    currentMessages.value.push({
      message_id: message.message_id,
      content: message.content,
      send_at: message.send_at,
      isMe: message.sender_id === currentUserId,
    });
    scrollToBottom();
  } else {
    // Message is from a different chat - reload contact list to show new chat
    await loadChats();
  }
};

/**
 * Scroll to bottom of messages
 */
const scrollToBottom = async () => {
  await nextTick();
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

/**
 * Open booking modal
 */
const openBookingModal = () => {
  bookingModalOpen.value = true;
};

/**
 * Create booking offer
 */
const createBookingOffer = async (offerData) => {
  try {
    const response = await fetch('http://localhost:3000/api/bookings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        request_id: selectedChat.value.request_id,
        ...offerData,
      }),
    });
    
    if (!response.ok) {
      // Extract error message from response
      const errorData = await response.json().catch(() => ({ error: 'Failed to create offer' }));
      throw new Error(errorData.error || 'Failed to create offer');
    }
    
    const booking = await response.json();
    
    // Add to local messages immediately for guide
    currentMessages.value.push({
      booking_offer: booking,
      isMe: true,
    });
    
    // Emit via WebSocket to notify traveller
    emit('booking_offer_created', {
      request_id: selectedChat.value.request_id,
      guide_id: currentUserId,
      booking,
    });
    
    bookingModalOpen.value = false;
    scrollToBottom();
  } catch (error) {
    console.error('Error creating offer:', error);
    alert(error.message || 'Failed to create booking offer. Please try again.');
  }
};

/**
 * Accept booking offer
 */
const acceptOffer = async (bookingId) => {
  try {
    const response = await fetch(`http://localhost:3000/api/bookings/${bookingId}/accept`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      // Extract error message from response
      const errorData = await response.json().catch(() => ({ error: 'Failed to accept offer' }));
      throw new Error(errorData.error || 'Failed to accept offer');
    }
    
    const updatedBooking = await response.json();
    
    // Update local message
    const msgIndex = currentMessages.value.findIndex(
      m => m.booking_offer?.booking_id === bookingId
    );
    if (msgIndex !== -1) {
      currentMessages.value[msgIndex].booking_offer = updatedBooking;
    }
    
    // Emit via WebSocket
    emit('booking_offer_accepted', {
      request_id: selectedChat.value.request_id,
      booking_id: bookingId,
    });
  } catch (error) {
    console.error('Error accepting offer:', error);
    alert(error.message || 'Failed to accept offer. Please try again.');
  }
};

/**
 * Decline booking offer
 */
const declineOffer = async (bookingId) => {
  try {
    const response = await fetch(`http://localhost:3000/api/bookings/${bookingId}/decline`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) throw new Error('Failed to decline offer');
    
    const updatedBooking = await response.json();
    
    // Update local message
    const msgIndex = currentMessages.value.findIndex(
      m => m.booking_offer?.booking_id === bookingId
    );
    if (msgIndex !== -1) {
      currentMessages.value[msgIndex].booking_offer = updatedBooking;
    }
    
    // Emit via WebSocket
    emit('booking_offer_declined', {
      request_id: selectedChat.value.request_id,
      booking_id: bookingId,
    });
  } catch (error) {
    console.error('Error declining offer:', error);
    alert('Failed to decline offer. Please try again.');
  }
};

/**
 * Helper functions for booking offer display
 */
const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const getStatusColor = (status) => {
  const colors = {
    pending: 'orange',
    confirmed: 'success',
    cancelled: 'error',
    completed: 'blue-grey',
  };
  return colors[status] || 'grey';
};

const getStatusText = (status) => {
  const texts = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    cancelled: 'Cancelled',
    completed: 'Completed',
  };
  return texts[status] || status;
};


// Lifecycle
onMounted(async () => {
  // Connect to WebSocket
  connect(token);
  
  // Listen for new messages
  onNewMessage(handleNewMessage);

  // Listen for new booking offers
  on('new_booking_offer', ({ booking }) => {
    // Only add if it's from another user (traveler receiving from guide)
    // Guide already added it locally when creating
    if (selectedChat.value && booking.guide_id !== currentUserId) {
      currentMessages.value.push({
        booking_offer: booking,
        isMe: false,
      });
      scrollToBottom();
    }
  });

  // Listen for booking offer updates
  on('booking_offer_updated', ({ booking_id, agreed, status }) => {
    const msgIndex = currentMessages.value.findIndex(
      m => m.booking_offer?.booking_id === booking_id
    );
    if (msgIndex !== -1) {
      if (agreed !== undefined) {
        currentMessages.value[msgIndex].booking_offer.agreed = agreed;
      }
      if (status !== undefined) {
        currentMessages.value[msgIndex].booking_offer.status = status;
      }
    }
  });
  
  // Load chats
  await loadChats();
  
  // Check if navigating from request details with request_id
  const requestId = route.query.request_id;
  if (requestId) {
    // Try to find existing chat for this request
    const existingChat = chats.value.find(chat => chat.request_id == requestId);
    
    if (existingChat) {
      // Chat exists, select it
      selectChat(existingChat);
    } else {
      // New conversation - fetch request details and create chat entry
      try {
        const requestResponse = await fetch(`http://localhost:3000/api/requests/${requestId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (requestResponse.ok) {
          const requestData = await requestResponse.json();
          
          // Create a chat object
          const newChat = {
            request_id: parseInt(requestId),
            title: requestData.title,
            city: requestData.city,
            country: requestData.country,
            date_from: requestData.date_from,
            date_to: requestData.date_to,
            counterparty_name: requestData.user_name,
            counterparty_avatar: null,
            counterparty_id: requestData.user_id,
            traveller_id: requestData.user_id,
            traveller_name: requestData.user_name,
            guide_id: currentUserId, // Current user is the guide initiating chat
          };
          
          // Add to chats list
          chats.value.unshift(newChat);
          
          // Select this chat
          selectChat(newChat);
        }
      } catch (error) {
        console.error('Error loading request details:', error);
      }
    }
  } else {
    // Auto-select first chat on desktop if no request_id
    if (!mobile.value && chats.value.length > 0) {
      selectChat(chats.value[0]);
    }
  }
});

onUnmounted(() => {
  disconnect();
});
</script>

<style scoped>
/* Custom Scrollbar for nicer look */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: transparent; 
}
::-webkit-scrollbar-thumb {
  background: #e0e0e0; 
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background: #bdbdbd; 
}

/* Remove default solo details margin */
.message-input :deep(.v-input__details) {
    display: none;
}
</style>
