import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from "pinia";
import "bootstrap/scss/bootstrap.scss";
import BootstrapVue from "@coreui/bootstrap-vue";

createApp(App)
  .use(createPinia())
  .use(BootstrapVue)
  .mount('#app')
