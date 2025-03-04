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
      <v-stage
          :config="stageConfig"
          ref="stageRef"
          @mousedown="startDrawing"
          @mousemove="draw"
          @mouseup="stopDrawing"
          @mouseleave="stopDrawing"
      >
        <v-layer>
          <!-- Background with colored background -->
          <v-rect :config="backgroundConfig"></v-rect>
          <v-text :config="textConfig"></v-text>

          <!-- Lines for drawing -->
          <v-line
              v-for="(line, index) in lines"
              :key="index"
              :config="{
        points: line.points,
        stroke: 'black',
        strokeWidth: 3,
        lineCap: 'round',
        lineJoin: 'round',
      }"
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
import { useDrawingStore } from "@/stores/useBoardStore.js";


const route = useRoute();
const lines = ref([]);
const router = useRouter();
const foldersBoardsStore = useFoldersBoardsStore();
const stageRef = ref(null);
const isDrawing = ref(false);
const eraserSize = ref(1);
const store = useDrawingStore();


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

const startDrawing = (e) => {
  isDrawing.value = true;
  const pos = e.target.getStage().getPointerPosition();
  lines.value.push({ points: [pos.x, pos.y] });
};

const draw = (e) => {
  // Only draw if the mouse is pressed down
  if (!isDrawing.value) return;

  const stage = e.target.getStage();
  const point = stage.getPointerPosition();

  // Add new point to the last line
  const lastLine = lines.value[lines.value.length - 1];
  // Create a new array with the updated points to ensure reactivity
  const newPoints = [...lastLine.points, point.x, point.y];

  // Update the points in a reactive way
  lines.value[lines.value.length - 1] = {
    ...lastLine,
    points: newPoints
  };

  // Проверка, если выбран инструмент "ластик"
  if (store.currentTool === 'eraser') {
    // Простая логика стирания
    eraseAtPosition(point);
  }
};

const eraseAtPosition = (pos) => {
  // Упрощенная версия: просто удаляем линии, которые находятся рядом с позицией ластика
  const eraserRadius = eraserSize.value;

  // Фильтруем линии, которые не должны быть стерты
  lines.value = lines.value.filter(line => {
    // Проверяем каждую точку линии
    for (let i = 0; i < line.points.length; i += 2) {
      const x = line.points[i];
      const y = line.points[i + 1];

      // Рассчитываем расстояние от точки до позиции ластика
      const dx = x - pos.x;
      const dy = y - pos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Если точка находится в радиусе ластика, удаляем линию
      if (distance <= eraserRadius) {
        return false;
      }
    }
    return true;
  });
};

const stopDrawing = () => {
  isDrawing.value = false;
};

</script>

<style scoped>

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