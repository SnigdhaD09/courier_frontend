<script setup>
import { onMounted } from "vue";
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import TripCard from "../components/TripCardComponent.vue";
import TripServices from "../services/TripServices.js";
import HotelServices from "../services/HotelServices.js";
import SiteServices from "../services/SiteServices.js";

const route = useRoute();
const router = useRouter();
const tripDays = ref([]);
const user = ref(null);
var isAdmin = ref(false);
const registered = ref(false);
const registeredTrips = ref([]);
const snackbar = ref({
  value: false,
  color: "",
  text: "",
});
const trip = ref({
  tripTitle: undefined,
  startdate: undefined,
  day: [],
  enddate: undefined,
  tripDescription: undefined,
  tripDestination: undefined,
  isArchived: false,
});

onMounted(async () => {
  user.value = JSON.parse(localStorage.getItem("user"));
  isAdmin.value = user.value.isAdmin;
  getTrip();
  getRegisteredTrips();
});

async function getRegisteredTrips() {
   
  await TripServices.getRegisteredTripsByUserId(user.value.id)
    .then((response) => {
      registeredTrips.value = response.data;
      console.log(registeredTrips);
      registered.value = false;
        for(var i=0; i< registeredTrips.value.length; i++){
            if(route.params.id == registeredTrips.value[i].tripId){
                registered.value = true;
            }
        }
    })
    .catch((error) => {
      console.log(error);
    });
}
async function getTrip() {
    var tripId = route.params.id;
  await TripServices.getTrip(tripId)
    .then((response) => {
      trip.value = response.data;
      console.log(trip.value.day);
      trip.value.startdate = formatDate(trip.value.startdate);
      trip.value.enddate = formatDate(trip.value.enddate);
      tripDays.value = trip.value.day;
    })
    .catch((error) => {
      console.log(error);
    });
}
async function registerForTrip() {

    var tripId = route.params.id;
    if(!registered.value){
        await TripServices.registerForTrip(user.value.id, tripId)
            .then((response) => {
                getRegisteredTrips();
            })
            .catch((error) => {
            console.log(error);
            });
    }else{
        await TripServices.unregisterForTrip(user.value.id, tripId)
            .then((response) => {
                getRegisteredTrips();
            })
            .catch((error) => {
            console.log(error);
            });
    }
}

async function navigateToEdit() {
    router.push({ path: "/trip/"+route.params.id });
}

function closeSnackBar() {
  snackbar.value.value = false;
}
function formatDate (date) {
  if (!date) return null;
  date = new Date(date).toISOString().substr(0, 10);
  const [year, month, day] = date.split('-');
  return `${year}-${month}-${day}`;
}

function formatDateForDay(date){
  if (!date) return null;
  return new Date(date).toDateString();  
}

function getSearchString(site){
    return "https://www.google.com/search?q=" + site.siteName + ", " + site.city + ", " + site.state ;
}

function getAnySearchString(site){
    return "https://www.google.com/search?q=" + site ;
}

</script>

<template>
  <v-container>
    <div id="body">
      <v-row align="center" class="mb-4">
        <v-col cols="6"
          ><v-card-title class="pl-0 text-h4 font-weight-bold"
            >View Trip
          </v-card-title>
        </v-col>
      </v-row>
      <v-card
    class="rounded-lg elevation-5 mb-8"
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
            v-if="user !== null && isAdmin"
            size="small"
            icon="mdi-pencil"
            @click="navigateToEdit()"
          ></v-icon>
          <v-btn v-if="!isAdmin" color="accent" @click="registerForTrip()"
            >{{registered?"Unregister":"Register"}}</v-btn
          >
        </v-col>
      </v-row>
    </v-card-title>
    <v-card-text class="body-1">
      Destination: <a :href=getAnySearchString(trip.tripDestination)>{{ trip.tripDestination }}</a>
    </v-card-text>
    <v-card-text class="body-1">
      {{ trip.tripDescription }}
    </v-card-text>
    <v-card-text class="body-1">
      Trip Days:
    </v-card-text>
   
    <v-list>
        <v-list-item
        v-for="(tripDay, dayCount) in tripDays"
        :key="tripDay.id"
        >
            <v-card class="rounded-lg elevation-6 mb-8">
                <v-card-title> Day {{ dayCount+1 }}: {{ formatDateForDay(tripDay.tripDate) }}</v-card-title>
        <v-row>
        <v-col cols="12">
          <v-card>
            <v-card-title>Hotel Name: {{ tripDay.hotel.hotelName }}
            <v-row>&nbsp;</v-row>
                <v-row style="font-size: medium;">
                    <v-col cols="1"></v-col>
                    <v-col cols="5">
                        <v-row>
                        <v-span>  Address:</v-span>
                        </v-row>
                        <v-row>
                        <v-span>{{tripDay.hotel.address}}</v-span>
                    </v-row>
                    <v-row>
                        <v-span>Phone Number:</v-span>
                        <v-span>{{tripDay.hotel.phoneNumber}}</v-span>
                    </v-row>
                    <v-row>
                        <v-span>Website:</v-span>
                        <v-span><a :href=tripDay.hotel.website>{{tripDay.hotel.website}}</a></v-span>
                    </v-row>
                    <v-row>
                        <v-span>Check In Date:</v-span>
                        <v-span>{{formatDate(tripDay.hotel.checkinDate)}}</v-span>
                    </v-row>
                    <v-row>
                        <v-span>Check Out Date:</v-span>
                        <v-span>{{formatDate(tripDay.hotel.checkoutDate)}}</v-span>
                    </v-row>
                    </v-col>
                    <v-col cols="6">
                        <a :href=tripDay.hotel.website>
                        <v-img :src="tripDay.hotel.hotelImage" aspect-ratio="2" alt="Hotel Image">
                            </v-img></a>
                    </v-col>
                </v-row>
            </v-card-title>
          </v-card>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12">
            <v-card-title>Sites for the Day</v-card-title>
        <v-list>
            <v-list-item
            v-for="daySite in tripDay.daysite"
            :key="daySite.id"
            >
            <v-card class="rounded-lg elevation-6 mb-8">
            <v-row>
                <v-col cols="1"></v-col>
                <v-col cols="5">
                <v-card-title>
                {{ daySite.site.siteName }}
                <p style="font-size: medium;">{{ daySite.site.siteDescription }}</p>
                <p style="font-size: medium;">{{ daySite.site.city }}, {{ daySite.site.state }}</p>
                </v-card-title>
                </v-col>
                <v-col cols="6">
                    <a :href="getSearchString(daySite.site)">
                    <v-img :src="daySite.site.siteImage" aspect-ratio="2" alt="Site Image">
                            </v-img>
                        </a>
                </v-col>
            </v-row>
            </v-card>
            </v-list-item>
        </v-list>
        </v-col>
      </v-row>
                <v-card-actions></v-card-actions>
            </v-card>            
        </v-list-item>
    </v-list>
    
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
