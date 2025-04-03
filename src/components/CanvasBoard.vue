<template>
  <v-card
      v-if="false"
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
  </v-card> <!-- DELETE IT!!! -->

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
import {Project} from "@/api/index.js"

const route = useRoute();
const router = useRouter();
const fileInputRef = ref(null);
const foldersBoardsStore = useFoldersBoardsStore();
const stageRef = ref(null);
const mainLayerRef = ref(null);
const selectionLayerRef = ref(null);
const isDrawing = ref(false);
const eraserSize = ref(15);
const store = useDrawingStore();
const transformerRef = ref(null);
const currentLine = ref(null);
const boardObjects = ref([]);
const selectedObject = ref(null);
const transformer = ref(null);
const activeTextNode = ref(null);
const TextNode = ref(null);
const textareaRef = ref(null);
const noteInputRef = ref(null);
const activeNoteNode = ref(null);

const boardId = computed(() => parseInt(route.params.boardId));
const currentBoard = computed(() => foldersBoardsStore.getBoardById(boardId.value));
const boardName = ref("");

watch(
    currentBoard,
    (newBoard) => {
      if (newBoard) {
        boardName.value = newBoard.name || "Нова папка";
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
  // const board = await getBoard(boardId.value);
  // boardName.value = board.name;

  let board = {};

  board.objects = (await Project.get({id: boardId.value})).content

  console.log(board)

  if (board.objects && board.objects.length > 0) {
    loadSavedObjects(board.objects);
  }
}

const loadSavedObjects = (objects) => {
  if (!mainLayerRef.value) return;

  const layer = mainLayerRef.value.getNode();

  objects.forEach(obj => {
    if (obj.type === 'line') {
      // Your existing line code
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
      // Your existing image code
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
    } else if (obj.type === 'text') {
      // Your existing text code
      const text = new Konva.Text({
        x: obj.x,
        y: obj.y,
        text: obj.text,
        fontSize: obj.fontSize || 18,
        fontFamily: obj.fontFamily || 'Arial',
        fill: obj.fill || 'black',
        width: obj.width,
        id: obj.id || `text-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        draggable: true
      });

      text.on('click', () => handleObjectClick(text));
      text.on('dblclick', () => editText(text));
      text.on('dragstart', (e) => handleDragStart(e));
      text.on('dragend', (e) => handleDragEnd(e));

      layer.add(text);
      boardObjects.value.push(text);
    } else if (obj.type === 'note') {
      // Create a background for the note
      const noteBackground = new Konva.Rect({
        x: 0,
        y: 0,
        width: obj.width || 200,
        height: obj.height || 150,
        fill: obj.backgroundColor || '#fff8b8',
        stroke: obj.borderColor || '#d9d082',
        strokeWidth: 1,
        cornerRadius: 5,
        shadowColor: 'black',
        shadowBlur: 5,
        shadowOffset: { x: 2, y: 2 },
        shadowOpacity: 0.2,
        id: `note-bg-${Date.now()}-${Math.floor(Math.random() * 1000)}`
      });

      // Create a text for the note
      const noteText = new Konva.Text({
        x: 10,
        y: 10,
        text: obj.text || 'Нажмите, чтобы редактировать заметку',
        fontSize: obj.fontSize || 16,
        fontFamily: obj.fontFamily || 'Arial',
        fill: obj.fill || '#333',
        width: (obj.width || 200) - 20,
        height: (obj.height || 150) - 20,
        padding: 5,
        id: `note-text-${Date.now()}-${Math.floor(Math.random() * 1000)}`
      });

      // Group note background and text
      const noteGroup = new Konva.Group({
        x: obj.x,
        y: obj.y,
        id: obj.id || `note-group-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        draggable: true
      });

      noteGroup.add(noteBackground);
      noteGroup.add(noteText);

      // Add event listeners to the group
      noteGroup.on('click', () => handleObjectClick(noteGroup));
      noteGroup.on('dblclick', () => editNote(noteGroup, noteText));
      noteGroup.on('dragstart', (e) => handleDragStart(e));
      noteGroup.on('dragend', (e) => handleDragEnd(e));

      layer.add(noteGroup);
      boardObjects.value.push(noteGroup);
    }
  });

  layer.draw();
};


onMounted(async () => {
  await onStartup();
  window.addEventListener('resize', handleResize);

  if (!textareaRef.value) {
    textareaRef.value = document.createElement('textarea');
    textareaRef.value.style.position = 'absolute';
    textareaRef.value.style.top = '0px';
    textareaRef.value.style.left = '0px';
    textareaRef.value.style.visibility = 'hidden';
    textareaRef.value.style.padding = '5px';
    textareaRef.value.style.border = '1px solid black';
    textareaRef.value.style.overflow = 'hidden';
    textareaRef.value.style.resize = 'none';
    textareaRef.value.style.transformOrigin = 'left top';
    textareaRef.value.style.backgroundColor = 'white';
    textareaRef.value.style.zIndex = '1000';
    document.body.appendChild(textareaRef.value);
  }

  // Ensure that event listeners are properly added
  if (textareaRef.value) {
    textareaRef.value.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        textareaRef.value.blur();
      }
    });

    // Replace your blur handler with the updated one
    textareaRef.value.addEventListener('blur', handleTextareaBlur);
  }
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  if (textareaRef.value) {
    document.body.removeChild(textareaRef.value);
  }
});

const handleStageClick = (e) => {
  console.log(81273698732469871235698)

  if (e.target === e.target.getStage()) {
    if (store.currentTool === 'text') {
      addTextNode(e);
    } else if (store.currentTool === 'note') {
      addNoteNode(e);
    } else {
      deselectAll();
    }
  }
};

const handleObjectClick = (obj) => {
  if (store.currentTool === 'pen' || store.currentTool === 'eraser') {
    return;
  }

  selectedObject.value = obj;

  if (transformer.value) {
    transformer.value.nodes([]);
  }

  transformer.value.nodes([obj]);

  selectionLayerRef.value.getNode().draw();
};

const deselectAll = () => {
  selectedObject.value = null;
  if (transformer.value) {
    transformer.value.nodes([]);
    selectionLayerRef.value.getNode().draw();
  }
  hideTextarea();
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

// New Text Functions
const addTextNode = (e) => {
  const stage = e.target.getStage();
  const pos = stage.getPointerPosition();

  const text = new Konva.Text({
    x: pos.x,
    y: pos.y,
    text: '',
    fontSize: 18,
    fontFamily: 'Arial',
    fill: 'black',
    width: 200,
    id: `text-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    draggable: true
  });

  text.on('click', () => handleObjectClick(text));
  text.on('dblclick', () => editText(text));
  text.on('dragstart', (e) => handleDragStart(e));
  text.on('dragend', (e) => handleDragEnd(e));
  text.on('transform', () => {
    text.setAttrs({
      width: text.width() * text.scaleX(),
      scaleX: 1
    });
  });

  mainLayerRef.value.getNode().add(text);
  boardObjects.value.push(text);
  mainLayerRef.value.getNode().draw();

  // Select and edit the text immediately
  handleObjectClick(text);
  editText(text);
  saveBoard();
};

const editText = (textNode) => {
  // Hide the transformer while editing
  transformer.value.nodes([]);  // Assuming 'transformer' is a ref
  selectionLayerRef.value.getNode().draw();  // Assuming 'selectionLayerRef' is a ref

  // Store reference to the active text node
  activeTextNode.value = textNode;  // Store the active text node in the ref

  const textPosition = textNode.absolutePosition();
  const stageContainer = stageRef.value.getNode().container();  // Assuming 'stageRef' is a ref
  const scale = stageRef.value.getNode().scaleX();

  // Calculate the correct position accounting for stage scale and scroll
  const areaPosition = {
    x: stageContainer.offsetLeft + textPosition.x * scale,
    y: stageContainer.offsetTop + textPosition.y * scale
  };

  // Show textarea
  textareaRef.value.value = textNode.text();
  textareaRef.value.style.position = 'absolute';
  textareaRef.value.style.top = areaPosition.y + 'px';
  textareaRef.value.style.left = areaPosition.x + 'px';
  textareaRef.value.style.width = (textNode.width() * scale) + 'px';
  textareaRef.value.style.height = 'auto';
  textareaRef.value.style.fontSize = (textNode.fontSize() * scale) + 'px';
  textareaRef.value.style.fontFamily = textNode.fontFamily();
  textareaRef.value.style.color = textNode.fill();
  textareaRef.value.style.visibility = 'visible';
  textareaRef.value.style.padding = '0px';
  textareaRef.value.style.margin = '0px';
  textareaRef.value.style.overflow = 'hidden';
  textareaRef.value.style.background = 'none';
  textareaRef.value.style.border = '1px dashed #999';
  textareaRef.value.style.outline = 'none';
  textareaRef.value.style.resize = 'none';

  // Focus textarea
  textareaRef.value.focus();
};

const handleTextareaChange = (e) => {
  // Ensure that 'activeTextNode' is properly used here
  if (activeTextNode.value) {  // Ensure we are accessing the correct 'activeTextNode'
    activeTextNode.value.text(e.target.value);  // Use the correct activeTextNode
    mainLayerRef.value.getNode().draw();  // Redraw the layer
  }
};

const handleTextareaBlur = () => {
  if (activeTextNode.value) {
    activeTextNode.value.text(textareaRef.value.value);
    mainLayerRef.value.getNode().draw();
    hideTextarea();
    saveBoard();
    activeTextNode.value = null;
  } else if (activeNoteNode.value) {
    activeNoteNode.value.text(textareaRef.value.value);
    mainLayerRef.value.getNode().draw();
    hideTextarea();
    saveBoard();
    activeNoteNode.value = null;
  }
};


const hideTextarea = () => {
  textareaRef.value.style.visibility = 'hidden';
  activeTextNode.value = null;
  activeNoteNode.value = null;
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
    else if (obj instanceof Konva.Image || obj instanceof Konva.Text) {
      const objPos = obj.position();
      if (
          pos.x >= objPos.x &&
          pos.x <= objPos.x + obj.width() &&
          pos.y >= objPos.y &&
          pos.y <= objPos.y + obj.height()
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

const addNoteNode = (e) => {
  const stage = e.target.getStage();
  const pos = stage.getPointerPosition();

  const noteBackground = new Konva.Rect({
    x: 0,
    y: 0,
    width: 200,
    height: 150,
    fill: '#fff8b8', // Yellow sticky note color
    stroke: '#d9d082',
    strokeWidth: 1,
    cornerRadius: 5,
    shadowColor: 'black',
    shadowBlur: 5,
    shadowOffset: { x: 2, y: 2 },
    shadowOpacity: 0.2,
    id: `note-bg-${Date.now()}-${Math.floor(Math.random() * 1000)}`
  });

  // Create a text for the note
  const noteText = new Konva.Text({
    x: 10,
    y: 10,
    text: 'Double-click to edit note',
    fontSize: 16,
    fontFamily: 'Arial',
    fill: '#333',
    width: 180,
    height: 130,
    padding: 5,
    id: `note-text-${Date.now()}-${Math.floor(Math.random() * 1000)}`
  });

  // Group note background and text
  const noteGroup = new Konva.Group({
    x: pos.x,
    y: pos.y,
    id: `note-group-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    draggable: true
  });

  noteGroup.add(noteBackground);
  noteGroup.add(noteText);

  // Add event listeners to the group
  noteGroup.on('click', () => handleObjectClick(noteGroup));
  noteGroup.on('dblclick', () => editNote(noteGroup, noteText));
  noteGroup.on('dragstart', (e) => handleDragStart(e));
  noteGroup.on('dragend', (e) => handleDragEnd(e));

  // Disable any scaling or resizing logic
  noteGroup.setAttrs({
    scaleX: 1,
    scaleY: 1,
  });

  // Remove any event listeners for scaling or resizing (transform event)
  // If you're using a transformer, ensure it's not added for the note
  noteGroup.on('transform', (e) => {
    // Cancel the transform event to prevent resizing
    e.cancelBubble = true;
  });

  // Prevent any scale changes
  noteGroup.scaleX(1);
  noteGroup.scaleY(1);

  mainLayerRef.value.getNode().add(noteGroup);
  boardObjects.value.push(noteGroup);
  mainLayerRef.value.getNode().draw();

  // Select and edit the note immediately
  handleObjectClick(noteGroup);
  editNote(noteGroup, noteText);
  saveBoard();
};

// Function to edit a note
const editNote = (noteGroup, textNode) => {
  // Hide the transformer while editing
  transformer.value.nodes([]);
  selectionLayerRef.value.getNode().draw();

  // Store reference to the active note node
  activeNoteNode.value = textNode;

  const notePosition = noteGroup.absolutePosition();
  const stageContainer = stageRef.value.getNode().container();
  const scale = stageRef.value.getNode().scaleX();

  // Calculate the correct position accounting for stage scale and scroll
  const areaPosition = {
    x: stageContainer.offsetLeft + (notePosition.x + textNode.x()) * scale,
    y: stageContainer.offsetTop + (notePosition.y + textNode.y()) * scale
  };

  // Show textarea
  textareaRef.value.value = textNode.text();
  textareaRef.value.style.position = 'absolute';
  textareaRef.value.style.top = areaPosition.y + 'px';
  textareaRef.value.style.left = areaPosition.x + 'px';
  textareaRef.value.style.width = (textNode.width() * scale) + 'px';
  textareaRef.value.style.height = (textNode.height() * scale) + 'px';
  textareaRef.value.style.fontSize = (textNode.fontSize() * scale) + 'px';
  textareaRef.value.style.fontFamily = textNode.fontFamily();
  textareaRef.value.style.color = textNode.fill();
  textareaRef.value.style.visibility = 'visible';
  textareaRef.value.style.padding = '5px';
  textareaRef.value.style.margin = '0px';
  textareaRef.value.style.overflow = 'auto';
  textareaRef.value.style.background = '#fff8b8';
  textareaRef.value.style.border = '1px dashed #d9d082';
  textareaRef.value.style.outline = 'none';
  textareaRef.value.style.resize = 'none';
  textareaRef.value.style.boxSizing = 'border-box'; // Add this to maintain consistent sizing

  // Focus textarea
  textareaRef.value.focus();
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
      console.error("Error downloading an image:", error);
      alert("Try again please.");
      event.target.value = '';
    };

    img.src = imageUrl;

  } catch (error) {
    console.error("Error downloading a file:", error);
    alert("Try again please.");
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
    } else if (obj instanceof Konva.Text) {
      return {
        id: obj.id(),
        type: 'text',
        x: obj.x(),
        y: obj.y(),
        text: obj.text(),
        fontSize: obj.fontSize(),
        fontFamily: obj.fontFamily(),
        fill: obj.fill(),
        width: obj.width()
      };
    } else if (obj instanceof Konva.Group && obj.id().includes('note-group')) {
      // Handle note groups
      const noteBackground = obj.findOne(node => node.id().includes('note-bg'));
      const noteText = obj.findOne(node => node.id().includes('note-text'));

      return {
        id: obj.id(),
        type: 'note',
        x: obj.x(),
        y: obj.y(),
        width: noteBackground.width(),
        height: noteBackground.height(),
        text: noteText.text(),
        fontSize: noteText.fontSize(),
        fontFamily: noteText.fontFamily(),
        fill: noteText.fill(),
        backgroundColor: noteBackground.fill(),
        borderColor: noteBackground.stroke()
      };
    }
    return null;
  }).filter(obj => obj !== null);

  console.log({
    id: boardId.value,
    content: serializedObjects,
  })

  Project.update({
    id: boardId.value,
    content: serializedObjects,
  })

  console.log(JSON.stringify({
    id: boardId.value,
    content: serializedObjects,
  }))

  // Uncomment this when you have the updateBoard function
  // updateBoard(boardId.value, { objects: serializedObjects });
};

const triggerFileInput = () => {
  if (fileInputRef.value) {
    fileInputRef.value.click();
  }
};

const deleteSelectedObject = () => {
  if (selectedObject.value) {
    // If it's a group (like a note), remove it properly
    if (selectedObject.value instanceof Konva.Group) {
      selectedObject.value.destroy();
    } else {
      selectedObject.value.destroy();
    }

    const index = boardObjects.value.findIndex(obj => obj === selectedObject.value);
    if (index !== -1) {
      boardObjects.value.splice(index, 1);
    }

    deselectAll();
    mainLayerRef.value.getNode().draw();
    saveBoard();
  }
};


const fetchBoard = async () => {
  const board = await Project.get({id: boardId.value});

  if (board.content !== null) {
    boardObjects.value = board.content;
    console.log(boardObjects.value);
  }
}


onMounted(() => {
  const transformerNode = new Konva.Transformer();
  mainLayerRef.value.getNode().add(transformerNode);
  transformer.value = transformerNode;

  fetchBoard()
});


onUnmounted(() => {
  textareaRef.value.addEventListener('blur', this.handleTextareaBlur);
})
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