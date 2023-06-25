import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "login",
      component: () => import("./views/Login.vue"),
    },
    {
      path: "/homepage",
      name: "homepage",
      component: () => import("./views/HomePage.vue"),
    },
    {
      path: "/trip/:id",
      name: "editTrip",
      props: true,
      component: () => import("./views/EditTrip.vue"),
    },
    {
      path: "/viewtrip/:id",
      name: "viewTrip",
      props: true,
      component: () => import("./views/ViewTrip.vue"),
    },
  ],
});

export default router;
