import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import VuePapaParse from 'vue-papa-parse'

createApp(App).use(VuePapaParse).use(router).mount('#app')
