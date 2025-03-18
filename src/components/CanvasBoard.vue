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
          <v-btn
              class="hover-visible"
              @click="goToHelp"
              :icon="show ? 'mdi-help-circle-outline' : 'mdi-help-circle'"
              size=""
          ></v-btn>

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
  <input
      type="file"
      ref="fileInputRef"
      @change="handleImageUpload"
      accept="image/*"
      style="display: none"
  />

  <ToolMenu
      :fileInputRef="fileInputRef"
      @trigger-file-input="triggerFileInput"
  />

    <div class="konva-container">
      <input
          type="file"
          ref="fileInputRef"
          @change="handleImageUpload"
          accept="image/*"
          style="display: none"
      />

      <div id="stage-cont">
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
<!--            <v-rect :config="backgroundConfig"></v-rect>-->
<!--            <v-text :config="textConfig"></v-text>-->

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
    </div>
</template>

<script setup>
import {ref, computed, onMounted, onUnmounted, watch} from "vue";
import { useRoute, useRouter } from 'vue-router';
import {useFoldersBoardsStore} from "@/stores/useBoardStore.js";
import ToolMenu from "@/components/ToolMenu.vue";
import {getBoard} from "@/utils/boardStotage.js";
import { useDrawingStore } from "@/stores/useBoardStore.js";
import Konva from 'konva';
import {image} from "@/api/index.js";


const route = useRoute();
const lines = ref([]);
const router = useRouter();
const fileInputRef = ref(null);
const foldersBoardsStore = useFoldersBoardsStore();
const stageRef = ref(null);
const isDrawing = ref(false);
const eraserSize = ref(1);
const store = useDrawingStore();


const boardId = computed(() => parseInt(route.params.boardId));

const currentBoard = computed(() => foldersBoardsStore.getBoardById(boardId.value));

const boardName = ref("");

watch(
    currentBoard,
    (newBoard) => {
      if (newBoard) {
        boardName.value = newBoard.name || "Новая папка";
      }
    },
    { immediate: true }
);

const stageConfig = ref({
  width: window.innerWidth,
  height: window.innerHeight - 64,
});

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
  if (!isDrawing.value) return;

  const stage = e.target.getStage();
  const point = stage.getPointerPosition();

  const lastLine = lines.value[lines.value.length - 1];
  const newPoints = [...lastLine.points, point.x, point.y];

  lines.value[lines.value.length - 1] = {
    ...lastLine,
    points: newPoints
  };

  if (store.currentTool === 'eraser') {
    eraseAtPosition(point);
  }
};

const eraseAtPosition = (pos) => {

  const eraserRadius = eraserSize.value;

  lines.value = lines.value.filter(line => {
    for (let i = 0; i < line.points.length; i += 2) {
      const x = line.points[i];
      const y = line.points[i + 1];

      const dx = x - pos.x;
      const dy = y - pos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

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

const handleImageUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  try {
    // Сначала загружаем файл на сервер
    const response = await image.upload({ file: file });
    console.log(response);  // Пример URL: https://fourex-lkc.s3.eu-north-1.amazonaws.com/beb93d65e1bd
    const imageUrl = response.url; // Используем полученный URL от сервера

    // Загружаем изображение по URL
    const img = new Image();
    img.crossOrigin = "Anonymous"; // Если изображение с другого домена

    // Устанавливаем обработчики до установки src
    img.onload = () => {
      const stage = stageRef.value.getNode();
      const pos = stage.getPointerPosition() || { x: 100, y: 100 };

      // Создаем изображение Konva
      const konvaImage = new Konva.Image({
        x: pos.x,
        y: pos.y,
        image: img, // Передаем сам объект изображения
        width: img.width > 300 ? 300 : img.width,
        height: img.width > 300 ? (img.height * 300) / img.width : img.height,
        draggable: true
      });

      // Добавляем обработчики событий для трансформации
      konvaImage.on('transform', () => {
        const scaleX = konvaImage.scaleX();
        const scaleY = konvaImage.scaleY();
        konvaImage.scaleX(1);
        konvaImage.scaleY(1);
        konvaImage.width(konvaImage.width() * scaleX);
        konvaImage.height(konvaImage.height() * scaleY);
      });

      // Получаем текущий слой
      const layer = stageRef.value.getNode().getLayers()[0];

      // Удаляем существующие трансформеры перед добавлением нового
      layer.find('Transformer').forEach(tr => tr.destroy());

      // Добавляем изображение и новый трансформер
      layer.add(konvaImage);

      const tr = new Konva.Transformer({
        nodes: [konvaImage],
        boundBoxFunc: (oldBox, newBox) => {
          if (newBox.width < 20 || newBox.height < 20) {
            return oldBox;
          }
          return newBox;
        }
      });

      layer.add(tr);
      layer.draw();

      // Сбрасываем выбор файла
      event.target.value = '';
    };

    // Обработчик ошибки загрузки изображения
    img.onerror = (error) => {
      console.error("Ошибка загрузки изображения:", error);
      alert("Не удалось загрузить изображение. Пожалуйста, попробуйте снова.");
      event.target.value = '';
    };

    // Установка src после определения обработчиков
    img.src = imageUrl;

  } catch (error) {
    console.error("Ошибка при загрузке файла:", error);
    alert("Не удалось загрузить файл. Пожалуйста, попробуйте снова.");
    event.target.value = '';
  }
};


const triggerFileInput = () => {
  if (fileInputRef.value) {
    fileInputRef.value.click();
  }
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