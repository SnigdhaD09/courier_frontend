<script setup>
import ocLogo from "/oc_logo.png";
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import UserServices from "../services/UserServices";

const router = useRouter();

const user = ref(null);
const title = ref("Trip System");
const logoURL = ref("");
const isCreateAccount = ref(false);
const updateButtonText = ref("Update Account");
var errorText = '';

onMounted(() => {
  logoURL.value = ocLogo;
  user.value = JSON.parse(localStorage.getItem("user"));
});

function openUpdateAccount(){
  isCreateAccount.value = true;
}
function closeUpdateAccount(){
  isCreateAccount.value = false;
}

function logout() {
  UserServices.logoutUser()
    .then((data) => {
      console.log(data);
    })
    .catch((error) => {
      console.log(error);
    });
  localStorage.removeItem("user");
  user.value = null;
  router.push({ name: "login" });
}

async function updateAccount() {
  await UserServices.updateUser(user.value.id, user.value)
    .then(() => {
      updateButtonText.value = "Account updated successfully! Closing Dialog in 6s...";
      setTimeout(() => {
        closeUpdateAccount();
        updateButtonText.value = "Update Account";
      }, "6000");      
      
    })
    .catch((error) => {
      console.log(error);
      errorText  = error.response.data.message;
    });
}

</script>

<template>
  <div>
    <v-app-bar color="primary" app dark>
      <router-link :to="{ name: 'homepage' }">
        <v-img
          class="mx-2"
          :src="logoURL"
          height="50"
          width="50"
          contain
        ></v-img>
      </router-link>
      <v-toolbar-title class="title">
        {{ title }}
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn class="mx-2" :to="{ name: 'homepage' }"> Home Page </v-btn>
      <v-btn v-if="user === null" class="mx-2" :to="{ name: 'login' }">
        Login
      </v-btn>
      <v-menu v-if="user !== null" min-width="200px" rounded>
        <template v-slot:activator="{ props }">
          <v-btn icon v-bind="props">
            <v-avatar class="mx-auto text-center" color="accent" size="large">
              <span class="white--text font-weight-bold">{{
                `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`
              }}</span>
            </v-avatar>
          </v-btn>
        </template>
        <v-card>
          <v-card-text>
            <div class="mx-auto text-center">
              <v-avatar color="accent">
                <span class="white--text text-h5">{{
                  `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`
                }}</span>
              </v-avatar>
              <h3>{{ `${user.firstName} ${user.lastName}` }}</h3>
              <p class="text-caption mt-1">
                {{ user.email }}
              </p>
              <v-divider class="my-3"></v-divider>
              <v-btn rounded variant="text" @click="openUpdateAccount()"> Update Account</v-btn>
              <v-divider class="my-3"></v-divider>
              <v-btn rounded variant="text" @click="logout()"> Logout </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-menu>
    </v-app-bar>
  </div>
  <v-dialog persistent v-model="isCreateAccount" width="800">
        <v-card class="rounded-lg elevation-5">
          <v-card-title class="headline mb-2">Update Account</v-card-title>
          <v-card-text>
            <v-span style="color: red;">{{ errorText }}</v-span>
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
              @click="closeUpdateAccount()"
              >Close</v-btn
            >
            <v-btn variant="flat" color="primary" @click="updateAccount()"
              >{{updateButtonText}}</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>
</template>
