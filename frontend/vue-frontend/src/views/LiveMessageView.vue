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

      </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue';
import { useDisplay } from 'vuetify';
import { useRoute } from 'vue-router';
import { useChat } from '@/composables/useChat';

const { mobile } = useDisplay();
const route = useRoute();
const { connect, joinRoom, sendMessage: sendSocketMessage, onNewMessage, loadChatHistory, disconnect } = useChat();

// State
const chats = ref([]);
const selectedChat = ref(null);
const currentMessages = ref([]);
const newMessage = ref('');
const messagesContainer = ref(null);
const loadingChats = ref(true);
const loadingMessages = ref(false);

// Get token and user info from localStorage
const token = localStorage.getItem('token');
let currentUserId = null;

// Decode JWT to get current user ID
if (token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    currentUserId = payload.id;
  } catch (e) {
    console.error('Failed to decode token:', e);
  }
}

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
    
    // Transform messages
    currentMessages.value = historyData.messages.map(msg => ({
      message_id: msg.message_id,
      content: msg.content,
      send_at: msg.send_at,
      isMe: msg.sender_id === currentUserId,
    }));

    // Join WebSocket room with guide_id
    joinRoom(chat.request_id, guideId);
    
    scrollToBottom();
  } catch (error) {
    console.error('Error loading chat history:', error);
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

// Lifecycle
onMounted(async () => {
  // Connect to WebSocket
  connect(token);
  
  // Listen for new messages
  onNewMessage(handleNewMessage);
  
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
