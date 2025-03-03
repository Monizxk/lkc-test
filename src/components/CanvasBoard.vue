<template>
  <v-card
      class="mx-auto"
  >
    <v-card-item style="background-color: #9FA8DA;">
      <div class="d-flex align-center justify-space-between">
        <v-card-title>
          LKC
        </v-card-title>
        <h2>{{ boardName }}</h2>
        <div>
          <!-- Кнопка довідки -->
          <v-btn
              class="hover-visible"
              @click="goToHelp"
              :icon="show ? 'mdi-help-circle-outline' : 'mdi-help-circle'"
              size=""
          ></v-btn>

          <!-- Avatar button with dropdown menu -->
          <v-menu open-on-click>
            <template v-slot:activator="{ props }">
              <v-btn
                  class="avatar-visible"
                  icon
                  v-bind="props"
                  size="small"
              >
                <v-avatar size="32">
                  <v-img
                      alt="John"
                      src="https://cdn.vuetifyjs.com/images/john.jpg"
                  ></v-img>
                </v-avatar>
              </v-btn>
            </template>
            <v-list>
              <v-list-item
                  v-for="(item, index) in menuItems"
                  :key="index"
                  @click="handleMenuItem(item)"
              >
                <v-list-item-title>{{ item.title }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>
      </div>
    </v-card-item>
  </v-card>
    <ToolMenu/>

    <div class="konva-container">
      <v-stage :config="stageConfig" ref="stageRef">
        <v-layer>
          <!-- Пустая доска с цветным фоном -->
          <v-rect :config="backgroundConfig"></v-rect>
          <v-text :config="textConfig"></v-text>

          <!-- Добавленный круг -->
          <v-circle
              :config="circleConfig"
              @dragstart="handleDragStart"
              @dragend="handleDragEnd"
              @dragmove="handleDragMove"
          />
        </v-layer>
      </v-stage>
    </div>
</template>

<script setup>
import {ref, computed, onMounted, onUnmounted, watch} from "vue";
import { useRoute, useRouter } from 'vue-router';
import {useFoldersBoardsStore} from "@/stores/useBoardStore.js";
import ToolMenu from "@/components/ToolMenu.vue";
import {getBoard} from "@/utils/boardStotage.js";

const route = useRoute();
const router = useRouter();
const foldersBoardsStore = useFoldersBoardsStore();
const stageRef = ref(null);

// Получаем ID доски из URL
const boardId = computed(() => parseInt(route.params.boardId));

const currentBoard = computed(() => foldersBoardsStore.getBoardById(boardId.value));

// Реактивное значение для имени, зависящее от ввода пользователя
const boardName = ref("");

// Следим за изменениями в `currentBoard`, чтобы обновлять `folderName`
watch(
    currentBoard,
    (newBoard) => {
      if (newBoard) {
        boardName.value = newBoard.name || "Новая папка";
      }
    },
    { immediate: true }
);

// Конфигурация для canvas (без container)
const stageConfig = ref({
  width: window.innerWidth,
  height: window.innerHeight - 64, // Вычитаем высоту заголовка
});

// Обновление размера канваса при изменении размера окна
const handleResize = () => {
  stageConfig.value.width = window.innerWidth;
  stageConfig.value.height = window.innerHeight - 64;
  backgroundConfig.value.width = stageConfig.value.width;
  backgroundConfig.value.height = stageConfig.value.height;
  textConfig.value.x = stageConfig.value.width / 2;
  textConfig.value.y = stageConfig.value.height / 2;
};

const onStartup = async () => {
  const board = await getBoard(boardId.value)
  boardName.value = board.name;

  console.log(board)
}

onMounted(async () => {
  await onStartup()
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});

// Конфигурация для фона доски
const backgroundConfig = ref({
  x: 0,
  y: 0,
  width: stageConfig.value.width,
  height: stageConfig.value.height,
  fill: "#e3f2fd", // Светло-синий фон
});

// Конфигурация для текста
const textConfig = ref({
  x: stageConfig.value.width / 2,
  y: stageConfig.value.height / 2,
  text: "help",
  fontSize: 24,
  fontFamily: "Arial",
  fill: "#1976d2",
  align: "center",
  width: 300,
  offsetX: 150 // центрирование текста
});

// // Конфигурация для круга
const circleConfig = ref({
  x: 100,
  y: 100,
  radius: 70,
  fill: "#FF5722",
  stroke: "#E64A19",
  strokeWidth: 2,
  draggable: true, // Возможность перетаскивания
  shadowColor: "black",
  shadowBlur: 5,
  shadowOffset: { x: 2, y: 2 },
  shadowOpacity: 0.3
});

const dragItemId = ref(null);


  const handleDragStart = (e) => {
    dragItemId.value = e.target.id();
    console.log("Drag started:", dragItemId.value);
  };

  const handleDragEnd = (e) => {
    console.log("Drag ended:", e.target.x(), e.target.y());
    dragItemId.value = null;
  };

  const handleDragMove = (e) => {
    console.log("Drag move:", e.target.x(), e.target.y());
  };

const goBack = () => {
  router.push('/files');
};

const serializeBoard = (boardId) => {

}
</script>

<style scoped>
.board-page {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.board-header {
  height: 64px;
  background-color: #1976d2;
  color: white;
  display: flex;
  align-items: center;
  padding: 0 16px;
}

.board-header h2 {
  margin-left: 16px;
}

.konva-container {
  flex-grow: 1;
  background-color: #bbdefb;
  position: relative;
}

.hover-visible {
  background: transparent !important;
  box-shadow: none !important;
  border: none !important;
  padding-right: 3px;
}

.avatar-visible {
  background: transparent !important;
  box-shadow: none !important;
  border: none !important;
}

.folder-wrapper:hover .folder-actions {
  opacity: 1;
}

h3 {
  margin: 0;
  font-size: 16px;
}

p {
  margin: 0;
  color: #666;
  font-size: 14px;
}
</style>