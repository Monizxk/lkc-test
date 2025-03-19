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
          @click="handleStageClick"
      >
        <v-layer ref="mainLayerRef">
        </v-layer>

        <v-layer ref="selectionLayerRef">
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
import {Image as ImageAPI} from "@/api/index.js";

const route = useRoute();
const router = useRouter();
const fileInputRef = ref(null);
const foldersBoardsStore = useFoldersBoardsStore();
const stageRef = ref(null);
const mainLayerRef = ref(null);
const selectionLayerRef = ref(null);
const isDrawing = ref(false);
const eraserSize = ref(10);
const store = useDrawingStore();

const currentLine = ref(null);
const boardObjects = ref([]);
const selectedObject = ref(null);
const transformer = ref(null);

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
};

const onStartup = async () => {
  const board = await getBoard(boardId.value);
  boardName.value = board.name;

  if (board.objects && board.objects.length > 0) {
    loadSavedObjects(board.objects);
  }
}

const loadSavedObjects = (objects) => {
  if (!mainLayerRef.value) return;

  const layer = mainLayerRef.value.getNode();

  objects.forEach(obj => {
    if (obj.type === 'line') {
      const line = new Konva.Line({
        points: obj.points,
        stroke: obj.stroke || 'black',
        strokeWidth: obj.strokeWidth || 3,
        lineCap: 'round',
        lineJoin: 'round',
        id: obj.id || `line-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        draggable: true
      });

      line.on('click', () => handleObjectClick(line));
      line.on('dragstart', (e) => handleDragStart(e));
      line.on('dragend', (e) => handleDragEnd(e));

      layer.add(line);
      boardObjects.value.push(line);
    } else if (obj.type === 'image') {
      const img = new Image();
      img.crossOrigin = "Anonymous";

      img.onload = () => {
        const konvaImage = new Konva.Image({
          x: obj.x,
          y: obj.y,
          image: img,
          width: obj.width,
          height: obj.height,
          id: obj.id || `image-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          draggable: true
        });

        konvaImage.on('click', () => handleObjectClick(konvaImage));
        konvaImage.on('dragstart', (e) => handleDragStart(e));
        konvaImage.on('dragend', (e) => handleDragEnd(e));

        layer.add(konvaImage);
        boardObjects.value.push(konvaImage);
        layer.draw();
      };

      img.src = obj.src;
    }
  });

  layer.draw();
}

onMounted(async () => {
  await onStartup();
  window.addEventListener('resize', handleResize);

  if (selectionLayerRef.value) {
    transformer.value = new Konva.Transformer({
      boundBoxFunc: (oldBox, newBox) => {
        if (newBox.width < 5 || newBox.height < 5) {
          return oldBox;
        }
        return newBox;
      }
    });

    selectionLayerRef.value.getNode().add(transformer.value);
  }
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});

const handleStageClick = (e) => {
  if (e.target === e.target.getStage()) {
    deselectAll();
  }
};

const handleObjectClick = (obj) => {
  if (store.currentTool === 'pen' || store.currentTool === 'eraser') {
    return;
  }

  selectedObject.value = obj;

  transformer.value.nodes([]);

  transformer.value.nodes([obj]);

  selectionLayerRef.value.getNode().draw();
};


const deselectAll = () => {
  selectedObject.value = null;
  if (transformer.value) {
    transformer.value.nodes([]);
    selectionLayerRef.value.getNode().draw();
  }
};

const handleDragStart = (e) => {
  const id = e.target.id();
  console.log("Drag started:", id);
};

const handleDragEnd = (e) => {
  console.log("Drag ended:", e.target.x(), e.target.y());


  const layer = mainLayerRef.value.getNode();
  layer.draw();


  saveBoard();
};


const startDrawing = (e) => {
  isDrawing.value = true;

  if (store.currentTool === 'eraser') {
    const pos = e.target.getStage().getPointerPosition();
    eraseAtPosition(pos);
    return;
  }

  if (store.currentTool === 'pen') {
    const pos = e.target.getStage().getPointerPosition();

    currentLine.value = new Konva.Line({
      points: [pos.x, pos.y],
      stroke: 'black',
      strokeWidth: 3,
      lineCap: 'round',
      lineJoin: 'round',
      id: `line-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      draggable: true
    });

    mainLayerRef.value.getNode().add(currentLine.value);

    currentLine.value.on('click', () => handleObjectClick(currentLine.value));
    currentLine.value.on('dragstart', (e) => handleDragStart(e));
    currentLine.value.on('dragend', (e) => handleDragEnd(e));
  }
};

const draw = (e) => {
  if (!isDrawing.value) return;

  const stage = e.target.getStage();
  const point = stage.getPointerPosition();

  if (store.currentTool === 'eraser') {
    eraseAtPosition(point);
    return;
  }

  if (store.currentTool === 'pen' && currentLine.value) {
    const newPoints = currentLine.value.points().concat([point.x, point.y]);
    currentLine.value.points(newPoints);
    mainLayerRef.value.getNode().draw();
  }
};

const stopDrawing = () => {
  if (!isDrawing.value) return;

  isDrawing.value = false;

  if (currentLine.value && store.currentTool === 'pen') {
    boardObjects.value.push(currentLine.value);

    saveBoard();
  }

  currentLine.value = null;
};

const eraseAtPosition = (pos) => {
  const layer = mainLayerRef.value.getNode();
  const eraserRadius = eraserSize.value;

  const objectsToRemove = [];

  layer.children.forEach(obj => {
    if (obj instanceof Konva.Line) {
      const points = obj.points();
      for (let i = 0; i < points.length; i += 2) {
        const x = points[i];
        const y = points[i + 1];

        const dx = x - pos.x;
        const dy = y - pos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= eraserRadius) {
          objectsToRemove.push(obj);
          break;
        }
      }
    }
    else if (obj instanceof Konva.Image) {
      const imagePos = obj.position();
      if (
          pos.x >= imagePos.x &&
          pos.x <= imagePos.x + obj.width() &&
          pos.y >= imagePos.y &&
          pos.y <= imagePos.y + obj.height()
      ) {
        objectsToRemove.push(obj);
      }
    }
  });

  objectsToRemove.forEach(obj => {
    if (selectedObject.value === obj) {
      deselectAll();
    }

    obj.destroy();

    const index = boardObjects.value.findIndex(item => item === obj);
    if (index !== -1) {
      boardObjects.value.splice(index, 1);
    }
  });

  layer.draw();

  if (objectsToRemove.length > 0) {
    saveBoard();
  }
};

const handleImageUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  try {
    const response = await ImageAPI.upload({ file: file });
    console.log(response);
    const imageUrl = response.url;

    const img = new Image();
    img.crossOrigin = "Anonymous";

    img.onload = () => {
      const stage = stageRef.value.getNode();
      const pos = stage.getPointerPosition() || { x: 100, y: 100 };

      const konvaImage = new Konva.Image({
        x: pos.x,
        y: pos.y,
        image: img,
        width: img.width > 300 ? 300 : img.width,
        height: img.width > 300 ? (img.height * 300) / img.width : img.height,
        id: `image-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        draggable: true
      });

      konvaImage.on('click', () => handleObjectClick(konvaImage));
      konvaImage.on('dragstart', (e) => handleDragStart(e));
      konvaImage.on('dragend', (e) => handleDragEnd(e));
      konvaImage.on('transform', () => {
        const scaleX = konvaImage.scaleX();
        const scaleY = konvaImage.scaleY();
        konvaImage.scaleX(1);
        konvaImage.scaleY(1);
        konvaImage.width(konvaImage.width() * scaleX);
        konvaImage.height(konvaImage.height() * scaleY);
      });

      mainLayerRef.value.getNode().add(konvaImage);
      boardObjects.value.push(konvaImage);

      mainLayerRef.value.getNode().draw();

      handleObjectClick(konvaImage);

      saveBoard();

      event.target.value = '';
    };

    img.onerror = (error) => {
      console.error("Ошибка загрузки изображения:", error);
      alert("Не удалось загрузить изображение. Пожалуйста, попробуйте снова.");
      event.target.value = '';
    };

    img.src = imageUrl;

  } catch (error) {
    console.error("Ошибка при загрузке файла:", error);
    alert("Не удалось загрузить файл. Пожалуйста, попробуйте снова.");
    event.target.value = '';
  }
};

const saveBoard = () => {
  const serializedObjects = boardObjects.value.map(obj => {
    if (obj instanceof Konva.Line) {
      return {
        id: obj.id(),
        type: 'line',
        points: obj.points(),
        stroke: obj.stroke(),
        strokeWidth: obj.strokeWidth()
      };
    } else if (obj instanceof Konva.Image) {
      return {
        id: obj.id(),
        type: 'image',
        x: obj.x(),
        y: obj.y(),
        width: obj.width(),
        height: obj.height(),
        src: obj.image().src
      };
    }
    return null;
  }).filter(obj => obj !== null);

  console.log("Сохранение состояния доски:", serializedObjects);

  // updateBoard(boardId.value, { objects: serializedObjects });
};

const triggerFileInput = () => {
  if (fileInputRef.value) {
    fileInputRef.value.click();
  }
};

const deleteSelectedObject = () => {
  if (selectedObject.value) {
    selectedObject.value.destroy();

    const index = boardObjects.value.findIndex(obj => obj === selectedObject.value);
    if (index !== -1) {
      boardObjects.value.splice(index, 1);
    }

    deselectAll();

    mainLayerRef.value.getNode().draw();

    saveBoard();
  }
};

onMounted(() => {
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (selectedObject.value) {
        deleteSelectedObject();
      }
    }
  });
});

onUnmounted(() => {
  window.removeEventListener('keydown', (e) => {
    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (selectedObject.value) {
        deleteSelectedObject();
      }
    }
  });
});

defineExpose({
  saveBoard,
  handleResize,
  deleteSelectedObject
});
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