<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";

// Существующий код...

// Инструменты для боковой панели
const tools = ref([
  { title: 'Draw', value: 'select', icon: 'mdi-draw' },
  { title: 'Eraser', value: 'rectangle', icon: 'mdi-eraser' },
  { title: 'Eyedropper', value: 'circle', icon: 'mdi-eyedropper' },
  { title: 'Add Text', value: 'text', icon: 'mdi-format-text' },
  { title: 'Image', value: 'image', icon: 'mdi-image-outline' },
  { title: 'Crop Image', value: 'line', icon: 'mdi-crop' },
  { title: 'Note', value: 'line', icon: 'mdi-note-outline' },

]);

// Текущий выбранный инструмент
const currentTool = ref('select');

// Функция выбора инструмента
const selectTool = (tool) => {
  currentTool.value = tool;
  // Тут можно добавить логику для создания соответствующих фигур на канвасе
  console.log('Выбран инструмент:', tool);
};
</script>

<template>
  <div class="tool-menu">
    <!-- Боковая панель инструментов -->
    <v-sheet class="sidebar-panel" width="64" color="grey-lighten-3" elevation="0">
      <v-list density="compact" nav>
        <v-list-item
            v-for="tool in tools"
            :key="tool.title"
            :value="tool.value"
            @click="selectTool(tool.value)"
        >
          <template v-slot:prepend>
            <v-icon :icon="tool.icon"></v-icon>
          </template>
          <v-tooltip
              activator="parent"
              location="right"
          >
            {{ tool.title }}
          </v-tooltip>
        </v-list-item>
      </v-list>
    </v-sheet>
  </div>
</template>

<style scoped>
.tool-menu {
  position: absolute;
  top: 85px; /* Adjust this value to match header height */
  left: 0;
  height: calc(100% - 64px); /* Subtract header height */
  z-index: 10;
}

.sidebar-panel {
  height: 100%;

}
.v-list {
  height: 100%;
  overflow: hidden;
}
</style>