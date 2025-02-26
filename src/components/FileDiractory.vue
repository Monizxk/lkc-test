<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useRouter } from 'vue-router'

const router = useRouter()
const folders = ref([]);

const loadFolders = () => {
  const savedFolders = localStorage.getItem("folders");
  folders.value = savedFolders ? JSON.parse(savedFolders) : [
    // { id: 1, name: "Folder 1", description: "1 card", icon: "mdi-folder", path: "/canva" },
    // { id: 2, name: "Folder 2", description: "2 cards", icon: "mdi-folder", path: "/canva" },
  ];
};

const saveFolders = () => {
  localStorage.setItem("folders", JSON.stringify(folders.value));
};

onMounted(loadFolders);

watch(folders, saveFolders, {deep: true});

const editingFolder = ref(null);
const editedName = ref("");
const editedDescription = ref("");
const editedIcon = ref("");
const showEditDialog = ref(false);
const showDeleteDialog = ref(false);
const folderToDelete = ref(null);

const isFormValid = computed(() => {
  return editedName.value.trim().length > 0 &&
      editedName.value.length <= 50 &&
      editedDescription.value.length <= 240;
});

const availableIcons = [
  { text: "Папка", value: "mdi-folder" },
  { text: "Документ", value: "mdi-file-document" },
  { text: "Зображення", value: "mdi-image" },
  { text: "Відео", value: "mdi-video" },
  { text: "Музика", value: "mdi-music" },
  { text: "Завантаження", value: "mdi-download" }
];

const createFolder = () => {
  const newFolder = {
    id: folders.value.length ? Math.max(...folders.value.map(f => f.id)) + 1 : 1,
    name: `Папка ${folders.value.length + 1}`.substring(0, 50),
    description: "Нова папка".substring(0, 240),
    icon: "mdi-folder",
    path: "/new-folder",
  };
  folders.value.push(newFolder);
  editingFolder.value = newFolder;
  editedName.value = newFolder.name;
  editedDescription.value = newFolder.description;
  editedIcon.value = newFolder.icon;
  showEditDialog.value = true;
};

const startEditing = (folder) => {
  editingFolder.value = folder;
  editedName.value = folder.name;
  editedDescription.value = folder.description;
  editedIcon.value = folder.icon;
  showEditDialog.value = true;
};

const saveEdits = () => {
  if (editingFolder.value && isFormValid.value) {
    const folder = folders.value.find(f => f.id === editingFolder.value.id);
    if (folder) {
      folder.name = editedName.value.trim();
      folder.description = editedDescription.value.trim();
      folder.icon = editedIcon.value;
    }
    editingFolder.value = null;
    showEditDialog.value = false;
  }
};

const cancelEditing = () => {
  editingFolder.value = null;
  showEditDialog.value = false;
};

const confirmDelete = (folder) => {
  folderToDelete.value = folder;
  showDeleteDialog.value = true;
};

const deleteFolder = () => {
  if (folderToDelete.value) {
    folders.value = folders.value.filter(f => f.id !== folderToDelete.value.id);
    folderToDelete.value = null;
    showDeleteDialog.value = false;
  }
};

const handleFolderClick = (event, folder) => {
  if (editingFolder.value === folder) {
    event.preventDefault();
  }
};
const menuItems = ref([
  { title: 'Account settings', action: 'settings' },
  { title: 'Log out', action: 'logout' }
]);

const handleMenuItem = (item) => {
  switch (item.action) {
    case 'settings':
      console.log('Opening account settings');
      break;
    case 'logout':
      console.log('Logging out');
      break;
    default:
      console.log(`Unknown action: ${item.action}`);
  }
};

const goToHelp = () => router.push('/help')

</script>

<template>
  <v-card
      class="mx-auto"
  >
    <v-card-item style="background-color: #9FA8DA;">
      <div class="d-flex align-center justify-space-between">
        <v-card-title>
          LKC
        </v-card-title>
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

  <v-card
      class="mx-auto"
  >
    <v-card-item style="background-color: #E8EAF6;">
      <div class="d-flex align-center justify-center">
        <v-btn
            id="button"
            class="text-none custom-button"
            color="medium-emphasis"
            min-width="92"
            variant="outlined"
            rounded
            @click="createFolder"
        >
          Create
        </v-btn>
      </div>
    </v-card-item>
  </v-card>

  <v-container>
    <v-row>
      <v-col
          v-for="folder in folders"
          :key="folder.id"
          cols="12"
          sm="6"
          md="4"
          lg="3"
      >
        <div class="folder-wrapper">
          <router-link
              :to="folder.path"
              class="folder"
              @click="(e) => handleFolderClick(e, folder)"
          >
            <div class="folder-content">
              <v-icon size="40">{{ folder.icon }}</v-icon>
              <div class="text">
                <h3>{{ folder.name }}</h3>
                <p>{{ folder.description }}</p>
              </div>
            </div>
          </router-link>
          <div class="folder-actions">
            <v-btn icon small @click="startEditing(folder)">
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn icon small @click="confirmDelete(folder)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </div>
        </div>
      </v-col>
    </v-row>
  </v-container>

  <!-- Edit Dialog -->
  <v-dialog v-model="showEditDialog" max-width="500px">
    <v-card>
      <v-card-title>Редагувати папку</v-card-title>
      <v-card-text>
        <v-text-field
            v-model="editedName"
            label="Назва папки"
            dense
            :counter="50"
            :rules="[v => !!v.trim() || 'Назва не може бути порожньою', v => v.length <= 50 || 'Назва не може бути довшою за 50 символів']"
        ></v-text-field>
        <v-text-field
            v-model="editedDescription"
            label="Опис"
            dense
            :counter="240"
            :rules="[v => v.length <= 240 || 'Назва не може бути довшою за 50 символів']"
        ></v-text-field>
        <v-select
            v-model="editedIcon"
            :items="availableIcons"
            label="Іконка"
            dense
        ></v-select>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="cancelEditing">Скасувати</v-btn>
        <v-btn color="primary" :disabled="!isFormValid" text @click="saveEdits">Зберегти</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Delete Confirmation Dialog -->
  <v-dialog v-model="showDeleteDialog" max-width="400px">
    <v-card>
      <v-card-title>Видалити папку</v-card-title>
      <v-card-text>
        Ви впевнені, що хочете видалити папку "{{ folderToDelete?.name }}"? Цю дію неможливо скасувати.
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="showDeleteDialog = false">Скасувати</v-btn>
        <v-btn color="error" text @click="deleteFolder">Видалити</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
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

.folder-wrapper {
  position: relative;
  margin-bottom: 15px;
}

.folder {
  background: #f0f0ff;
  padding: 20px;
  border-radius: 12px;
  text-decoration: none;
  color: inherit;
  display: block;
  transition: background-color 0.3s;
}

.folder:hover {
  background: #e0e0ff;
}

.folder-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.folder-actions {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 5px;
  opacity: 0;
  transition: opacity 0.3s;
}

.folder-wrapper:hover .folder-actions {
  opacity: 1;
}

.text {
  text-align: center;
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