// Функции для работы с IndexedDB

// Вспомогательная функция для преобразования любого типа ключа в строку
export const toStringKey = (key) => {
    if (key === null || key === undefined) {
        return '';
    }
    return String(key);
};

// Функция для инициализации базы данных
export const initDB = (dbName, storeName, version = 1) => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, version);
        request.onerror = (event) => {
            reject(`Ошибка открытия базы данных: ${event.target.error}`);
        };
        request.onsuccess = (event) => {
            const db = event.target.result;
            resolve(db);
        };
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            // Создаем хранилище объектов, если его еще нет
            if (!db.objectStoreNames.contains(storeName)) {
                db.createObjectStore(storeName, { keyPath: 'id' });
            }
        };
    });
};

// Функция для вставки данных (принимает ключ и значение в формате JSON)
export const insertData = async (dbName, storeName, key, value) => {
    try {
        const db = await initDB(dbName, storeName);
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);

            // Преобразуем ключ в строку
            const stringKey = toStringKey(key);

            // Используем ключ только для идентификации записи, но не добавляем в значение
            const data = { id: stringKey, value: value };

            const request = store.put(data);

            request.onsuccess = () => {
                resolve(true);
            };

            request.onerror = (event) => {
                reject(`Ошибка при вставке данных: ${event.target.error}`);
            };

            transaction.oncomplete = () => {
                db.close();
            };
        });
    } catch (error) {
        console.error('Ошибка в insertData:', error);
        throw error;
    }
};

// Функция для получения данных по ключу
export const getDataByKey = async (dbName, storeName, key) => {
    try {
        const db = await initDB(dbName, storeName);
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);

            // Преобразуем ключ в строку
            const stringKey = toStringKey(key);

            const request = store.get(stringKey);

            request.onsuccess = (event) => {
                const result = event.target.result;
                // Возвращаем только значение без id
                resolve(result ? result.value : undefined);
            };

            request.onerror = (event) => {
                reject(`Ошибка при получении данных: ${event.target.error}`);
            };

            transaction.oncomplete = () => {
                db.close();
            };
        });
    } catch (error) {
        console.error('Ошибка в getDataByKey:', error);
        throw error;
    }
};

// Функция для получения всех объектов из хранилища
export const getAllData = async (dbName, storeName) => {
    try {
        const db = await initDB(dbName, storeName);
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);

            const request = store.getAll();

            request.onsuccess = (event) => {
                const results = event.target.result;
                // Преобразуем результаты, чтобы вернуть только значения
                const values = results.map(item => item.value);
                resolve(values);
            };

            request.onerror = (event) => {
                reject(`Ошибка при получении всех данных: ${event.target.error}`);
            };

            transaction.oncomplete = () => {
                db.close();
            };
        });
    } catch (error) {
        console.error('Ошибка в getAllData:', error);
        throw error;
    }
};

// Функция для удаления данных по ключу
export const deleteDataByKey = async (dbName, storeName, key) => {
    try {
        const db = await initDB(dbName, storeName);
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);

            // Преобразуем ключ в строку
            const stringKey = toStringKey(key);

            const request = store.delete(stringKey);

            request.onsuccess = () => {
                resolve(true);
            };

            request.onerror = (event) => {
                reject(`Ошибка при удалении данных: ${event.target.error}`);
            };

            transaction.oncomplete = () => {
                db.close();
            };
        });
    } catch (error) {
        console.error('Ошибка в deleteDataByKey:', error);
        throw error;
    }
};