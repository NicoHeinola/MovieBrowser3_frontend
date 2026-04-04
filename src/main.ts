/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Composables
import { createApp } from 'vue';

// Plugins
import { registerPlugins } from '@/plugins';

// Styles
import '@/styles/main.scss';

// Components
import App from './App.vue';

const app = createApp(App);

registerPlugins(app);

app.mount('#app');
