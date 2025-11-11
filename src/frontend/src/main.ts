import { registerPlugins } from "@/plugins";
import App from "./App.vue";
import { createApp } from "vue";
import "unfonts.css";
import router from "./router";

const app = createApp(App);
app.use(router);

registerPlugins(app);

app.mount("#app");
