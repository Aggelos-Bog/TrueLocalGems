<template>
  <div style="height: 100vh; padding-top: 80px;">
    <v-container fluid class="pa-0" style="height: calc(100vh - 80px);">
      <v-row no-gutters style="height: 100%;">
      <!-- Left Sidebar: Contacts List -->
      <v-col 
        cols="12" 
        md="3" 
        class="border-e d-flex flex-column"
        v-show="!mobile || !selectedContact"
      >
        <!-- Sidebar Header (optional, maybe search?) -->
        <v-toolbar flat color="white" class="border-b">
           <v-toolbar-title class="text-h6 font-weight-bold pl-4">Messages</v-toolbar-title>
        </v-toolbar>

        <v-list lines="two" class="flex-grow-1 overflow-y-auto pa-0">
          <v-list-item
            v-for="contact in contacts"
            :key="contact.id"
            :value="contact"
            :active="selectedContact?.id === contact.id"
            active-color="primary"
            class="py-3 border-b"
            @click="selectContact(contact)"
          >
            <template v-slot:prepend>
              <v-avatar size="48" color="grey-lighten-2">
                <v-img v-if="contact.avatar" :src="contact.avatar" cover></v-img>
                <span v-else class="text-h6">{{ contact.name.charAt(0) }}</span>
              </v-avatar>
            </template>

            <v-list-item-title class="font-weight-medium mb-1">
              {{ contact.name }}
            </v-list-item-title>
            <v-list-item-subtitle class="text-truncate">
              {{ contact.lastMessage }}
            </v-list-item-subtitle>
            
             <template v-slot:append>
                <span class="text-caption text-grey">{{ contact.time }}</span>
            </template>
          </v-list-item>
        </v-list>
      </v-col>

      <!-- Right Main Area: Chat Window -->
      <v-col 
         cols="12" 
         md="9" 
         class="d-flex flex-column bg-grey-lighten-4"
         v-show="!mobile || selectedContact"
         style="height: 100%;"
      >
        
        <!-- Chat Header -->
        <v-toolbar flat color="white" class="border-b px-2" height="72">
          <template v-if="selectedContact">
            <v-btn icon class="d-md-none mr-2" @click="selectedContact = null">
               <v-icon>mdi-arrow-left</v-icon>
            </v-btn>
            <v-avatar size="40" class="mr-3" color="grey-lighten-2">
               <v-img v-if="selectedContact.avatar" :src="selectedContact.avatar" cover></v-img>
               <span v-else>{{ selectedContact.name.charAt(0) }}</span>
            </v-avatar>
            <div class="d-flex flex-column">
              <span class="text-subtitle-1 font-weight-bold">{{ selectedContact.name }}</span>
              <span class="text-caption text-grey">Online</span>
            </div>
            <v-spacer></v-spacer>
            <v-btn icon color="grey-darken-1">
              <v-icon>mdi-dots-vertical</v-icon>
            </v-btn>
          </template>
          <template v-else>
             <div class="text-subtitle-1 text-grey pl-4">Select a conversation</div>
          </template>
        </v-toolbar>

        <!-- Messages Area -->
        <div 
          v-if="selectedContact" 
          class="flex-grow-1 overflow-y-auto pa-4"
          ref="messagesContainer"
        >
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
               <v-img v-if="selectedContact.avatar" :src="selectedContact.avatar" cover></v-img>
                <span v-else>{{ selectedContact.name.charAt(0) }}</span>
             </v-avatar>

            <div 
              class="pa-3 rounded-lg text-body-2"
              :class="msg.isMe ? 'bg-primary text-white rounded-br-0' : 'bg-white rounded-bl-0 elevation-1'"
              style="max-width: 70%;"
            >
              {{ msg.text }}
            </div>
             
             <!-- Time stamp could go here -->
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
        <div v-if="selectedContact" class="bg-white px-4 py-3 border-t">
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
                  <template v-slot:prepend-inner>
                     <!-- Emoji removed -->
                  </template>
                  <template v-slot:append-inner>
                      <!-- Attachment removed -->
                  </template>
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
import { ref, nextTick, computed } from 'vue';
import { useDisplay } from 'vuetify';

const { mobile } = useDisplay();

// --- Mock Data ---
const mockContacts = [
  { 
    id: 1, 
    name: 'Alice Johnson', 
    avatar: 'https://i.pravatar.cc/150?u=alice', 
    lastMessage: 'Sounds good! See you then.',
    time: '10:30 AM'
  },
  { 
    id: 2, 
    name: 'Bob Smith', 
    avatar: 'https://i.pravatar.cc/150?u=bob', 
    lastMessage: 'Can you send me the details?',
    time: 'Yesterday'
  },
  { 
    id: 3, 
    name: 'Carol White', 
    avatar: 'https://i.pravatar.cc/150?u=carol', 
    lastMessage: 'Thanks for the help!',
    time: 'Yesterday'
  },
  {
      id: 4,
      name: 'David Brown',
      avatar: null, // text avatar test
      lastMessage: 'Are we still meeting?',
      time: 'Mon'
  }
];

const mockMessages = {
    1: [
        { id: 1, text: 'Hi Alice, how are you?', isMe: true },
        { id: 2, text: 'I am doing great! Thanks for asking.', isMe: false },
        { id: 3, text: 'Are we still on for the trip tomorrow?', isMe: true },
        { id: 4, text: 'Absolutely! I have everything ready.', isMe: false },
        { id: 5, text: 'Perfect. What time should we meet?', isMe: true },
        { id: 6, text: 'Let s say 9:00 AM at the station.', isMe: false },
        { id: 7, text: 'Sounds good! See you then.', isMe: true },
    ],
    2: [
        { id: 1, text: 'Hey Bob', isMe: true },
        { id: 2, text: 'What is up?', isMe: false },
        { id: 3, text: 'Can you send me the details?', isMe: false },
    ],
    3: [
         { id: 1, text: 'I fixed the issue you were having.', isMe: true },
         { id: 2, text: 'Oh wow, that was fast!', isMe: false },
         { id: 3, text: 'Thanks for the help!', isMe: false },
    ],
    4: [
        { id: 1, text: 'Hello David', isMe: true },
        { id: 2, text: 'Are we still meeting?', isMe: false}
    ]
}

// --- State ---
const contacts = ref(mockContacts);
const selectedContact = ref(mobile.value ? null : mockContacts[0]); // Null on mobile (list first), first on desktop
const newMessage = ref('');
const messagesStore = ref(mockMessages); // Use a ref so we can update it
const messagesContainer = ref(null);

// --- Computed ---
const currentMessages = computed(() => {
    if (!selectedContact.value) return [];
    return messagesStore.value[selectedContact.value.id] || [];
});

// --- Methods ---
const selectContact = (contact) => {
    selectedContact.value = contact;
    scrollToBottom();
};

const sendMessage = () => {
    if (!newMessage.value.trim() || !selectedContact.value) return;

    // Add to local store
    if (!messagesStore.value[selectedContact.value.id]) {
        messagesStore.value[selectedContact.value.id] = [];
    }

    messagesStore.value[selectedContact.value.id].push({
        id: Date.now(),
        text: newMessage.value,
        isMe: true
    });

    // Update last message in sidebar
    const contactIdx = contacts.value.findIndex(c => c.id === selectedContact.value.id);
    if (contactIdx !== -1) {
        contacts.value[contactIdx].lastMessage = newMessage.value;
        contacts.value[contactIdx].time = 'Now';
        
        // Move to top (optional, but nice)
        const contact = contacts.value.splice(contactIdx, 1)[0];
        contacts.value.unshift(contact);
    }

    newMessage.value = '';
    scrollToBottom();
    
    // Auto-reply mock (optional fun)
    setTimeout(() => {
         messagesStore.value[selectedContact.value.id].push({
            id: Date.now() + 1,
            text: "This is a mock auto-reply!",
            isMe: false
        });
        scrollToBottom();
    }, 2000);
};

const scrollToBottom = async () => {
    await nextTick();
    if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
}
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
