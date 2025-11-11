import { createRouter, createWebHistory } from "vue-router";
import TopProfessors from "@/components/TopProfessors.vue";
import Professor from "@/components/Professor.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", name: "TopProfessors", component: TopProfessors },
    { path: "/professor/:id", name: "Professor", component: Professor },
  ],
});

export default router;
