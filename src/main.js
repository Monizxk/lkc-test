// Import necessary libraries
import { createApp } from 'vue';
import { createPinia } from 'pinia'
import App from './App.vue';
import vuetify from './plugins/vuetify'; // Import the Vuetify plugin you already defined
import { registerPlugins } from '@/plugins';
import VueKonva from 'vue-konva';
import router from './router';

// Create Vue app
const app = createApp(App);
const pinia = createPinia()

// Register plugins
registerPlugins(app);

// Use plugins
app.use(vuetify); // Use the imported Vuetify plugin
app.use(VueKonva);
app.use(router);
app.use(pinia)

// Mount the app
app.mount('#app');