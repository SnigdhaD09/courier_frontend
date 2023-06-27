import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "loginhome",
      component: () => import("./views/LoginHome.vue"),
    },
    {
      path: "/adminlogin",
      name: "adminlogin",
      component: () => import("./views/AdminLogin.vue"),
    },
    {
      path: "/adminhomepage",
      name: "adminhomepage",
      component: () => import("./views/AdminHomePage.vue"),
    },
  ],
});

export default router;
