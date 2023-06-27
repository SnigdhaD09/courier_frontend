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
var homePageName;

onMounted(async () => {
  if (localStorage.getItem("user") !== null) {
    user.value = JSON.parse(localStorage.getItem("user"));
    if(user.value.isAdmin){
      homePageName = 'adminhomepage';
    }    
    router.push({ name: homePageName });
  }
});

function adminLogin() {
  router.push({ name: 'adminlogin' });
}

function closeCreateAccount() {
  isCreateAccount.value = false;
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
      </v-card>

      <v-dialog persistent v-model="isCreateAccount" width="800">
        <v-card class="rounded-lg elevation-5">
          <v-card-title class="headline mb-2">Create Account </v-card-title>
          <v-card-text>
            <v-text-field
              v-model="user.firstName"
              label="First Name"
              required
            ></v-text-field>

            <v-text-field
              v-model="user.lastName"
              label="Last Name"
              required
            ></v-text-field>
            <v-text-field
              v-model="user.address"
              label="Address"
              required
            ></v-text-field>
            <v-text-field
              v-model="user.phoneNumber"
              label="Phone Number"
              required
            ></v-text-field>

            <v-text-field
              v-model="user.email"
              label="Email"
              required
            ></v-text-field>

            <v-text-field
              v-model="user.password"
              label="Password"
              required
            ></v-text-field>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              variant="flat"
              color="secondary"
              @click="closeCreateAccount()"
              >Close</v-btn
            >
            <v-btn variant="flat" color="primary" @click="createAccount()"
              >Create Account</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>

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
