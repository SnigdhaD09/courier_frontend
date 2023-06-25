<script setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import TripServices from "../services/TripServices.js";

const router = useRouter();

const showDetails = ref(false);
const user = ref(null);
const sharedTrip = ref(0);
const isShareTrip = ref(false);
const email = ref("");
const isFavorite = ref(false);
const heart = "mdi-heart";
const heartOutline = "mdi-heart-outline";

const props = defineProps({
  trip: {
    required: true,
  },
});
const snackbar = ref({
  value: false,
  color: "",
  text: "",
});
onMounted(async () => {
  user.value = JSON.parse(localStorage.getItem("user"));
  checkFavorite(props.trip.id);
});

function navigateToEdit() {
  router.push({ name: "editTrip", params: { id: props.trip.id } });
}
async function copyTrip(tripId) {
  await TripServices.copyTrip(tripId)
    .then((response) => {
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = response.data.message;
      setTimeout(() => {
        router.push({ name: "viewTrip", params: { id: response.data.id } });
      }, "2000");      
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response.data.message;
    });
}
function openShareTrip(tripId){
  isShareTrip.value = true;
  sharedTrip.value = tripId;
  email.value = "";
}
function closeShareTrip(){
  isShareTrip.value = false;
  sharedTrip.value = 0;
  email.value = "";
}
async function shareTrip() {
  var emailObject = {"email": email.value};
  await TripServices.shareTrip(sharedTrip.value, emailObject)
    .then((response) => {
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = response.data.message;
      setTimeout(() => {
        closeShareTrip();
      }, "2000");
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response.data.message;
    });
}
async function checkFavorite(tripId) {
  await TripServices.checkFavorite(user.value.id, tripId)
      .then((response) => {
        isFavorite.value = response.data;
      })
      .catch((error) => {
        console.log(error);
    });
}

async function markFavorite(tripId) {
  if(!isFavorite.value){
    await TripServices.markFavorite(user.value.id, tripId)
      .then((response) => {
        isFavorite.value = true;
        snackbar.value.value = true;
        snackbar.value.color = "green";
        snackbar.value.text = response.data.message;
      })
      .catch((error) => {
        console.log(error);
        snackbar.value.value = true;
        snackbar.value.color = "error";
        snackbar.value.text = error.response.data.message;
      });
    } else {
      await TripServices.markNotFavorite(user.value.id, tripId)
      .then((response) => {
        isFavorite.value = false;
        snackbar.value.value = true;
        snackbar.value.color = "green";
        snackbar.value.text = response.data.message;
      })
      .catch((error) => {
        console.log(error);
        snackbar.value.value = true;
        snackbar.value.color = "error";
        snackbar.value.text = error.response.data.message;
      });  
    }
}

function navigateToView() {
  router.push({ name: "viewTrip", params: { id: props.trip.id } });
}
</script>

<template>
  <v-card
    class="rounded-lg elevation-5 mb-8"
    @click="navigateToView()"
  >
    <v-card-title class="headline">
      <v-row align="center">
        <v-col cols="10">
          {{ trip.tripTitle }}
          <v-chip class="ma-2" color="primary" label>
            <v-icon start icon="mdi-clock-outline"></v-icon>
            Trip Start: {{ new Date(trip.startdate).toDateString() }} 
          </v-chip>
          <v-chip class="ma-2" color="accent" label>
            <v-icon start icon="mdi-clock-outline"></v-icon>
            Trip End: {{ new Date(trip.enddate).toDateString() }}
          </v-chip>
        </v-col>
        <v-col class="d-flex justify-end">
          <v-icon
            v-if="user !== null"
            size="small"
            icon="mdi-share"
            @click.stop="openShareTrip(trip.id)"
          ></v-icon>
        </v-col>
        <v-col class="d-flex justify-end">
          <v-icon
            v-if="user !== null"
            size="small"
            :icon=isFavorite?heart:heartOutline
            @click.stop="markFavorite(trip.id)"
          ></v-icon>
        </v-col>
        <v-col class="d-flex justify-end">
          <v-icon
            v-if="user !== null && user.isAdmin"
            size="small"
            icon="mdi-content-copy"
            @click.stop="copyTrip(trip.id)"
          ></v-icon>
        </v-col>
        <v-col class="d-flex justify-end">
          <v-icon
            v-if="user !== null && user.isAdmin"
            size="small"
            icon="mdi-pencil"
            @click.stop="navigateToEdit()"
          ></v-icon>
        </v-col>
      </v-row>
    </v-card-title>
    <v-card-text class="body-1">
      {{ trip.tripDestination }}
    </v-card-text>
    
  </v-card>

  <v-dialog
      persistent
      :model-value="isShareTrip"
      width="800"
    >
      <v-card class="rounded-lg elevation-5">
        <v-card-title class="headline mb-2">Share Trip</v-card-title>
        <v-card-text>
          
          <v-row>
            <v-col cols="8">
              <v-text-field
              v-model="email"
              type="email"
              label="Enter an Email"
              required
            ></v-text-field>
            </v-col>
          </v-row>
        </v-card-text>
        
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            variant="flat"
            color="secondary"
            @click="closeShareTrip()"
            >Close</v-btn
          >
          <v-btn
            variant="flat"
            color="primary"
            @click="shareTrip()"
            >Send Trip</v-btn
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
</template>
