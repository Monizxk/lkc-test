<script setup>
import { ref } from "vue";
import { instance } from "@/api/base.js";

const props = defineProps({
  projectId: String,
  getContextMethod: Function,
});

const messageText = ref("");
const history = ref([]);
const isOpen = ref(false); // Стан відкритості/закритості чату

const toggleChat = () => {
  isOpen.value = !isOpen.value;
};

const sendMessage = async () => {
  const text = messageText.value;
  if (!text.trim()) return;

  messageText.value = "";
  history.value.push({ role: 1, content: text });

  try {
    const payload = {
      content: text
    };

    if (props.getContextMethod) {
      payload.context = props.getContextMethod();
    }

    if (history.value.length > 0) {
      payload.history = history.value;
    }

    const response = await instance.post(`/chat/${props.projectId}/message`, payload);

    history.value.push({ role: 0, content: response.data.content });
  } catch (error) {
    console.error("Error sending message:", error);
    history.value.push({ role: 0, content: "Error: Failed to get response" });
  }
};

const handleKeyDown = (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
};
</script>

<template>
  <div class="chat-container">
    <!-- Чат вікно -->
    <transition name="slide">
      <v-card v-if="isOpen" class="chat-card">
        <v-card-title class="chat-title">
          AI Chat
        </v-card-title>

        <v-card-text class="chat-history">
          <div v-for="(message, index) in history" :key="index" 
               :class="['message', message.role === 1 ? 'user-message' : 'ai-message']">
            <strong>{{ message.role === 1 ? 'You' : 'AI' }}:</strong> {{ message.content }}
          </div>
        </v-card-text>

        <v-card-item class="input-container">
          <v-text-field
            hide-details="true"
            append-inner-icon="mdi-send"
            v-model="messageText"
            placeholder="Type your message here..."
            @click:append-inner="sendMessage"
            @keydown="handleKeyDown"
            class="message-input"
          />
        </v-card-item>
      </v-card>
    </transition>
    
    <!-- Кнопка перемикання чату -->
    <button class="toggle-button" @click="toggleChat">
      <v-icon>{{ isOpen ? 'mdi-close' : 'mdi-chat' }}</v-icon>
    </button>
  </div>
</template>

<style scoped>
.chat-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
}

.toggle-button {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #9FA8DA;
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  z-index: 1001;
}

.chat-card {
  width: 400px;
  height: 300px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  margin-bottom: 60px; /* Відступ внизу для кнопки */
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  position: absolute;
  bottom: 0;
  right: 0;
}

.chat-title {
  padding: 8px 16px;
  background-color: #f5f5f5;
  border-bottom: 1px solid #ddd;
  font-size: 16px;
}

.chat-history {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  max-height: 200px;
}

.message {
  margin-bottom: 8px;
  padding: 8px;
  border-radius: 8px;
  max-width: 80%;
}

.user-message {
  background-color: #e3f2fd;
  text-align: right;
  margin-left: auto;
}

.ai-message {
  background-color: #f5f5f5;
  text-align: left;
  margin-right: auto;
}

.input-container {
  padding: 8px;
  border-top: 1px solid #ddd;
}

.message-input {
  width: 100%;
}

/* Анімація появи/зникнення чату */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateY(20px);
  opacity: 0;
}
</style>