<script setup>
import { onMounted } from "vue";
import { ref, toRaw } from "vue";
import { useRouter } from "vue-router";
import UserServices from "../services/UserServices.js";

const router = useRouter();
const isCreateAccount = ref(false);
const snackbar = ref({
  value: false,
  color: "",
  text: "",
});
const user = ref({
  firstName: undefined,
  lastName: undefined,
  email: undefined,
  password: undefined,
  address: undefined,
  phoneNumber: undefined,
});

onMounted(async () => {
  if (localStorage.getItem("user") !== null) {
    user.value = JSON.parse(localStorage.getItem("user"));
    if(user.value.isAdmin){
      homePageName = 'adminhomepage';
    }else if(user.value.isCashier){
      homePageName = 'cashierhomepage';
    }    
    router.push({ name: homePageName });
  }
});

function navigateToRecipes() {
  router.push({ name: "homepage" });
}

async function createAccount() {
  await UserServices.addUser(user.value)
    .then(() => {
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = "Account created successfully!";
      router.push({ name: "login" });
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response.data.message;
    });
}

async function login() {
  console.log(user.value);
  await UserServices.loginUser(user)
    .then((data) => {
      window.localStorage.setItem("user", JSON.stringify(data.data));
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = "Login successful!";
      router.push({ name: "homepage" });
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response.data.message;
    });
}
function adminLogin() {
  router.push({ name: 'adminlogin' });
}
function cashierLogin() {
  router.push({ name: 'cashierlogin' });
}
function courierLogin() {
  router.push({ name: 'courierlogin' });
}

function closeSnackBar() {
  snackbar.value.value = false;
}
</script>

<template>
  <v-container>
    <div id="body">
      <v-card class="rounded-lg elevation-5">
        <v-card-title class="headline mb-2">Select User</v-card-title>
        <v-card-text>
          <v-btn variant="flat" color="primary" @click="adminLogin()">Admin</v-btn>
        </v-card-text>
        <v-card-text>
          <v-btn variant="flat" color="primary" @click="cashierLogin()">Cashier</v-btn>
        </v-card-text>
        <v-card-text>
          <v-btn variant="flat" color="primary" @click="courierLogin()">Courier</v-btn>
        </v-card-text>
      </v-card>

      <v-snackbar v-model="snackbar.value" rounded="pill">
        {{ snackbar.text }}

        <template v-slot:actions>
          <v-btn
            :color="snackbar.color"
            variant="text"
            @click="closeSnackBar()"
          >
            Close
          </v-btn>
        </template>
      </v-snackbar>
    </div>
  </v-container>
</template>
