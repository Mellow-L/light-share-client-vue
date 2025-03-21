import {createPinia} from "pinia";
import {createApp} from "vue";
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import {IconFont} from "@nutui/icons-vue";
import NutUI from "@nutui/nutui"
import "@nutui/nutui/dist/style.css"
import router from "@/router/my-router";
import '@arco-design/web-vue/dist/arco.css'
import App from "@/App.vue";
import ArcoVue from "@arco-design/web-vue";


const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

const app = createApp(App)
app.use(pinia)
app.use(NutUI)
app.use(IconFont)
app.use(router)
app.use(ArcoVue)

app.mount('#app')


