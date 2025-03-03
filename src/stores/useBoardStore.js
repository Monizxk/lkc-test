import { defineStore } from 'pinia';
import {ref, computed, watch} from 'vue';


export const useFoldersBoardsStore = defineStore('foldersBoardsStore', () => {
    const folders = ref([]);
    const boards = ref([]);
    const editingFolder = ref(null);
    const editedName = ref('');
    const editedDescription = ref('');
    const editedIcon = ref('');
    const showEditDialog = ref(false);

    console.log(694870894733987341325404790834958)

    // получить папку по ID
    const getFolderById = computed(() => {
        return (id) => folders.value.find(folder => folder.id === id);
    });

    // получить доску по ID
    const getBoardById = (id) => boards.value.find(board => board.id === id);

    // Получить доску, связанную с папкой
    const getBoardByFolderId = computed(() => {
        return (folderId) => boards.value.find(board => board.folderId === folderId);
    });

    // створить новую папку і доску
    const createFolder = () => {
        // Создание новой папки
        const newFolderId = folders.value.length ? Math.max(...folders.value.map(f => f.id)) + 1 : 1;
        const folderName = `Папка ${folders.value.length + 1}`.substring(0, 50);


        const newFolder = {
            id: newFolderId,
            name: folderName,
            description: "Новая папка".substring(0, 240),
            icon: "mdi-folder",
            path: `/folder/${newFolderId}`,
            boardId: null
        };

        const newBoardId = boards.value.length ? Math.max(...boards.value.map(b => b.id)) + 1 : 1;
        const newBoard = {
            id: newBoardId,
            folderId: newFolderId,
            name: folderName, // используем то же название, что и у папки
            konvaConfig: {
                width: 800,
                height: 600,
            },
            objects: [] // Пустой массив для объектов доски
        };


        // Связываем папку с доской
        newFolder.boardId = newBoardId;

        // Добавляем папку и доску в соответствующие массивы
        folders.value.push(newFolder);
        boards.value.push(newBoard);

        // Устанавливаем редактируемую папку
        editingFolder.value = newFolder;
        editedName.value = newFolder.name;
        editedDescription.value = newFolder.description;
        editedIcon.value = newFolder.icon;
        showEditDialog.value = true;

        return { folder: newFolder, board: newBoard };
    };



    watch(
        () => folders.value.map(folder => ({ id: folder.id, name: folder.name, boardId: folder.boardId })),
        (updatedFolders) => {
            updatedFolders.forEach(({ id, name, boardId }) => {
                // Способ 1: Обновление по folderId
                const boardByFolder = getBoardByFolderId.value(id);
                if (boardByFolder && boardByFolder.name !== name) {
                    const boardIndex = boards.value.findIndex(b => b.id === boardByFolder.id);
                    if (boardIndex !== -1) {
                        boards.value[boardIndex] = { ...boards.value[boardIndex], name: name };
                    }
                }

                // // Способ 2: Обновление по boardId (если они связаны напрямую)
                // if (boardId) {
                //     const boardIndex = boards.value.findIndex(b => b.id === boardId);
                //     if (boardIndex !== -1 && boards.value[boardIndex].name !== name) {
                //         boards.value[boardIndex] = { ...boards.value[boardIndex], name: name };
                //     }
                // }
            });
        },
        { deep: true }
    );


    watch(
        () => boards.value.map(board => ({ id: board.id, name: board.name, folderId: board.folderId })),
        (updatedBoards) => {
            updatedBoards.forEach(({ id, name, folderId }) => {
                if (folderId) {
                    const folderIndex = folders.value.findIndex(f => f.id === folderId);
                    if (folderIndex !== -1 && folders.value[folderIndex].name !== name) {
                        folders.value[folderIndex] = { ...folders.value[folderIndex], name: name };
                    }
                }
            });
        },
        { deep: true }
    );


    // Начать редактирование папки
    const startEditing = (folder) => {
        editingFolder.value = folder;
        editedName.value = folder.name;
        editedDescription.value = folder.description;
        editedIcon.value = folder.icon;
        showEditDialog.value = true;
    };

    // Сохранить изменения папки
    const saveFolder = () => {
        if (editingFolder.value) {
            const folderIndex = folders.value.findIndex(f => f.id === editingFolder.value.id);
            if (folderIndex !== -1) {
                // Обновляем папку реактивно (важно создать новый объект для реактивности)
                folders.value[folderIndex] = {
                    ...folders.value[folderIndex],
                    name: editedName.value,
                    description: editedDescription.value,
                    icon: editedIcon.value
                };

                // Обновляем название доски, связанной с папкой
                // Это должно сработать автоматически через watch выше, но дублируем для надежности
                const boardIndex = boards.value.findIndex(b => b.folderId === editingFolder.value.id);
                if (boardIndex !== -1) {
                    boards.value[boardIndex] = {
                        ...boards.value[boardIndex],
                        name: editedName.value
                    };
                }
            }
        }
        showEditDialog.value = false;
    };

    // Удалить папку и связанную доску
    const deleteFolder = (folder) => {
        // Удаляем связанную доску
        const boardIndex = boards.value.findIndex(b => b.id === folder.boardId);
        if (boardIndex !== -1) {
            boards.value.splice(boardIndex, 1);
        }

        // Удаляем папку
        const folderIndex = folders.value.findIndex(f => f.id === folder.id);
        if (folderIndex !== -1) {
            folders.value.splice(folderIndex, 1);
        }
    };

    // Подтверждение удаления папки
    const confirmDeleteFolder = ref(null);
    const showDeleteDialog = ref(false);

    const confirmDelete = (folder) => {
        confirmDeleteFolder.value = folder;
        showDeleteDialog.value = true;
    };

    return {
        folders,
        boards,
        editingFolder,
        editedName,
        editedDescription,
        editedIcon,
        showEditDialog,
        confirmDeleteFolder,
        showDeleteDialog,
        getFolderById,
        getBoardById,
        getBoardByFolderId,
        createFolder,
        startEditing,
        saveFolder,
        deleteFolder,
        confirmDelete
    };
});