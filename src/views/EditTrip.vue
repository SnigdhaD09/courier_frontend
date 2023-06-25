<script setup>
import { onMounted } from "vue";
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import TripCard from "../components/TripCardComponent.vue";
import TripServices from "../services/TripServices.js";
import TripDayServices from "../services/TripDayServices.js";
import HotelServices from "../services/HotelServices.js";
import SiteServices from "../services/SiteServices.js";
import DaySiteServices from "../services/DaySiteServices.js";

const route = useRoute();
const router = useRouter();
const trips = ref([]);
const tripDays = ref([]);

const hotel = ref({});
const selectedHotel = ref({});
const selectedDaySite = ref({});
const selectedSite = ref({});
const hotels = ref([]);
const sites = ref([]);
var daySites = ref([]);
const isAdd = ref(false);
const isUpdate = ref(false);
const isAddDay = ref(false);
const isEditDaySite = ref(false);
const isEditDay = ref(false);
const isAddHotel = ref(false);
const isViewHotel = ref(false);
const user = ref(null);
var isAdmin = ref(false);
const snackbar = ref({
  value: false,
  color: "",
  text: "",
});
var newTrip = ref({
  tripTitle: undefined,
  startdate: undefined,
  enddate: undefined,
  tripDescription: undefined,
  tripDestination: undefined,
  isArchived: false,
});
var newDay = ref({
  tripDate: undefined,
  tripId: undefined,
  hotelId: undefined,
});
var newDaySite = ref({
  dayId: undefined,
  siteId: undefined,
});
const newHotel = ref({
  hotelName: undefined,
  address: undefined,
  website: undefined,
  hotelImage: undefined,
  checkinDate: undefined,
  checkoutDate: undefined,
  phoneNumber: undefined,
});

onMounted(async () => {
  console.log(route.params);
  if(route.params.id !== undefined){
    isUpdate.value = true;
    getTrip();
  }
  await getTrips();
  user.value = JSON.parse(localStorage.getItem("user"));
  isAdmin.value = user.value.isAdmin;
  await getHotels();
});

async function getTrip() {
  console.log(route.params);
  await TripServices.getTrip(route.params.id)
    .then((response) => {
      openAdd();
      newTrip.value = response.data;
      newTrip.value.startdate = formatDate(newTrip.value.startdate);
      newTrip.value.enddate = formatDate(newTrip.value.enddate);
    })
    .catch((error) => {
      console.log(error);
    });
    await getTripDays();
}

async function updateTrip() {
  await TripServices.updateTrip(newTrip.value.id, newTrip.value)
    .then(() => {
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = `${newTrip.value.tripTitle} updated successfully!`;
      router.push({ name: "homepage" });
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response.data.message;
    });
}


async function getTrips() {
  user.value = JSON.parse(localStorage.getItem("user"));
  if (user.value !== null && user.value.id !== null && user.value.isAdmin === false) {
    await TripServices.getRegisteredTripsByUserId(user.value.id)
      .then((response) => {
        trips.value = response.data;
      })
      .catch((error) => {
        console.log(error);
        snackbar.value.value = true;
        snackbar.value.color = "error";
        snackbar.value.text = error.response.data.message;
      });
  } else {
    await TripServices.getTrips()
      .then((response) => {
        trips.value = response.data;
        // console.log(trips);
      })
      .catch((error) => {
        console.log(error);
        snackbar.value.value = true;
        snackbar.value.color = "error";
        snackbar.value.text = error.response.data.message;
      });
  }
}

function openAddDay(){
  daySites = ref([]);
  getSites();
  selectedSite.value = undefined;
  newDay.value.id = undefined;
  newDay.value.tripDate = undefined;
  newDay.value.tripId = undefined;
  newDay.value.hotelId = undefined;
  selectedHotel.value = undefined;
  isAddDay.value = true;
}

function openEditDaySite(daySite){
  selectedSite.value = daySite.site;
  newDaySite.value.id = daySite.id;
  newDaySite.value.dayId = daySite.dayId;
  newDaySite.value.siteId = daySite.siteId;
  isEditDaySite.value = true;
}

async function deleteDaySite(daySite) {
  await DaySiteServices.deleteDaySite(daySite)
    .then(() => {
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = `${daySite.site.siteName} deleted successfully!`;
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response.data.message;
    });
  await getDaySites();
}
async function addDaySite() {
  // isAddDaySite.value = false;
  newDaySite.value.dayId = newDay.value.id;
  newDaySite.value.siteId = selectedSite.value.id;
  delete newDaySite.value.id;
  await DaySiteServices.addDaySite(newDaySite.value)
    .then(() => {
      selectedSite.value = undefined; 
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = `Day Site added successfully!`;
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response.data.message;
    });
  await getDaySites();
}

function openEditDay(day){
  daySites = ref([]);
  newDay.value.id = day.id;
  newDay.value.tripDate = formatDate(day.tripDate);
  newDay.value.tripId = day.tripId;
  newDay.value.hotelId = day.hotelId;
  selectedHotel.value = day.hotel;
  selectedSite.value = undefined;
  isEditDay.value = true;
  getDaySites();
  getSites();
}

function closeAddDay() {
  isAddDay.value = false;
}

function closeEditDay() {
  isEditDay.value = false;
}
function closeEditDaySite() {
  isEditDaySite.value = false;
}

async function getTripDays() {
  await TripDayServices.getTripDaysForTrip(route.params.id)
    .then((response) => {
      tripDays.value = response.data;
    })
    .catch((error) => {
      console.log(error);
    });
}


async function addDay() {
  isAddDay.value = false;
  newDay.value.tripId = newTrip.value.id;
  newDay.value.hotelId = selectedHotel.value.id;
  delete newDay.value.id;
  await TripDayServices.addTripDay(newDay.value)
    .then(() => {
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = `Day added successfully!`;
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response.data.message;
    });
  await getTripDays();
}

async function updateDay() {
  isEditDay.value = false;
  newDay.value.tripId = newTrip.value.id;
  newDay.value.hotelId = selectedHotel.value.id;
  await TripDayServices.updateTripDay(newDay.value)
    .then(() => {
      console.log(selectedHotel);
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = `Day updated successfully!`;
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response.data.message;
    });
  await getTripDays();
}
async function updateDaySite() {
  newDaySite.value.siteId = selectedSite.value.id;
  await DaySiteServices.updateDaySite(newDaySite.value)
    .then(() => {
      isEditDaySite.value = false;
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = `Day Site updated successfully!`;
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response.data.message;
    });
  await getDaySites();
}

async function deleteDay(day) {
  await TripDayServices.deleteTripDay(day)
    .then(() => {
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = `${day.hotel.hotelName} deleted successfully!`;
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response.data.message;
    });
  await getTripDays();
}

async function addTrip() {
  await TripServices.addTrip(newTrip.value)
    .then(() => {
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = `${newTrip.value.tripTitle} added successfully!`;
      isAdd.value = false;
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response.data.message;
    });
  await getTrips();
}
async function getHotels() {
  await HotelServices.getHotels()
    .then((response) => {
      hotels.value = response.data;
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response.data.message;
    });
}
async function getSites() {
  await SiteServices.getSites()
    .then((response) => {
      sites.value = response.data;
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response.data.message;
    });
}
async function getDaySites() {
  await DaySiteServices.getDaySitesForDay(newDay.value.id)
    .then((response) => {
      daySites.value = response.data;
      console.log(daySites.value);
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response.data.message;
    });
}

function openAdd() {
  newTrip = ref({
    tripTitle: undefined,
    startdate: undefined,
    enddate: undefined,
    tripDescription: undefined,
    tripDestination: undefined,
    isArchived: false,
  });
  isAdd.value = true;
}

function closeAdd() {
  isAdd.value = false;
  if(updateTrip){
    router.push({ name: "homepage" });
  }
}

function openAddHotel() {
  closeViewHotel();
  isAddHotel.value = true;
}

function closeAddHotel() {
  isAddHotel.value = false;
}

function openViewHotel() {
  isViewHotel.value = true;
}

function closeViewHotel() {
  isViewHotel.value = false;
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

</script>

<template>
  <v-container>
    <div id="body">
      <v-row align="center" class="mb-4">
        <v-col cols="6"
          ><v-card-title class="pl-0 text-h4 font-weight-bold"
            >HomePage
          </v-card-title>
        </v-col>
        <v-col class="d-flex justify-end" cols="2">
          <v-btn v-if="isAdmin" color="accent" @click="openAddHotel()"
            >Add Hotel</v-btn
          >
        </v-col>
        <v-col class="d-flex justify-end" cols="2">
          <v-btn v-if="isAdmin" color="accent" @click="openViewHotel()"
            >View Hotels</v-btn
          >
        </v-col>
        <v-col class="d-flex justify-end" cols="2">
          <v-btn v-if="isAdmin" color="accent" @click="openAdd()"
            >Add Trip</v-btn
          >
        </v-col>
      </v-row>

      <TripCard
        v-for="trip in trips"
        :key="trip.id"
        :trip="trip"
        @deletedList="getLists()"
      />

      <v-dialog persistent v-model="isAdd" width="800">
        <v-card class="rounded-lg elevation-5">
          <v-card-title v-if="!isUpdate" class="headline mb-2">Add Trip </v-card-title>
          <v-card-title v-if="isUpdate" class="headline mb-2">Update Trip </v-card-title>
          <v-card-text>
            <v-text-field
              v-model="newTrip.tripTitle"
              label="Title"
              required
            ></v-text-field>

            <v-text-field
              v-model.date="newTrip.startdate"
              label="Start Date"
              type="date"
              required
            ></v-text-field>
            <v-text-field
              v-model.date="newTrip.enddate"
              label="End Date"
              type="date"
              required
            ></v-text-field>

            <v-textarea
              v-model="newTrip.tripDescription"
              label="Description"
              required
            ></v-textarea>
            <v-text-field
              v-model="newTrip.tripDestination"
              label="Destination"
              required
            ></v-text-field>
            <v-switch
              v-model="newTrip.isArchived"
              hide-details
              inset
              :label="`Archive? ${newTrip.isArchived ? 'Yes' : 'No'}`"
            ></v-switch>
          </v-card-text>
          
          <v-spacer></v-spacer>
          <v-row>
            <v-col>
              <v-card class="rounded-lg elevation-5">
                <v-card-title
                  ><v-row align="center">
                    <v-col cols="4"
                      ><v-card-title class="headline">Days </v-card-title>
                    </v-col>
                    <v-col cols="4"
                      ><v-card-title class="headline">Hotels </v-card-title>
                    </v-col>
                    <v-col class="d-flex justify-end" cols="4">
                      <v-btn color="accent" @click="openAddDay()">Add Day</v-btn>
                    </v-col>
                  </v-row>
                </v-card-title>
                <v-card-text>
                  <v-list>
                    <v-list-item
                      v-for="tripDay in tripDays"
                      :key="tripDay.id"
                    >
                    <v-row>
                      <v-col cols="4">
                      <b>{{ formatDate(tripDay.tripDate) }}
                        </b>
                      </v-col>
                      <v-col cols="4">
                      <b>{{ tripDay.hotel.hotelName }}
                        </b>
                        </v-col>
                        <v-col cols="4">
                          </v-col>
                        </v-row>

                      <template v-slot:append>
                        <v-row>
                          <v-icon
                            class="mx-2"
                            size="x-small"
                            icon="mdi-pencil"
                            @click="openEditDay(tripDay)"
                          ></v-icon>
                          <v-icon
                            class="mx-2"
                            size="x-small"
                            icon="mdi-trash-can"
                            @click="deleteDay(tripDay)"
                          ></v-icon>
                        </v-row>
                      </template>
                    </v-list-item>
                  </v-list>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
          <!-- <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn v-if="!isUpdateDay" variant="flat" color="primary" @click="addDay()"
              >Add Day</v-btn
            >
            <v-btn v-if="isUpdateDay" variant="flat" color="primary" @click="updateDay()"
              >Update Day</v-btn
            >
          </v-card-actions> -->
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn variant="flat" color="secondary" @click="closeAdd()"
              >Close</v-btn
            >
            <v-btn v-if="!isUpdate" variant="flat" color="primary" @click="addTrip()"
              >Add Trip</v-btn
            >
            <v-btn v-if="isUpdate" variant="flat" color="primary" @click="updateTrip()"
              >Update Trip</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog
      persistent
      :model-value="isAddDay || isEditDay"
      width="800"
    >
      <v-card class="rounded-lg elevation-5">
        <v-card-title class="headline mb-2">{{
          isAddDay
            ? "Add Day"
            : isEditDay
            ? "Edit Day"
            : ""
        }}</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="3">
              <v-text-field
                v-model="newDay.tripDate"
                label="Day Date"
                type="date"
                required
              >
              </v-text-field>
            </v-col>
            <v-col>
              <v-select
                v-model="selectedHotel"
                :items="hotels"
                item-title="hotelName"
                item-value="id"
                label="Hotel"
                return-object
                required
              >
                <template slot="item" slot-scope="data">
                  <v-list-tile-content>
                    <v-list-tile-title v-html="data.item.hotelName"></v-list-tile-title>
                  </v-list-tile-content>
                </template>
              </v-select>
            </v-col>
          </v-row>
          <v-row v-if="isEditDay">
            <v-col cols="8">
              <v-select
                v-model="selectedSite"
                :items="sites"
                item-title="siteName"
                item-value="id"
                label="Select Site"
                return-object
                required
              >
                <template slot="item" slot-scope="data">
                  <v-list-tile-content>
                    <v-list-tile-title v-html="data.item.siteName"></v-list-tile-title>
                  </v-list-tile-content>
                </template>
              </v-select>
            </v-col>
            <v-col  cols="4">
              <v-btn
            variant="flat"
            color="primary"
            @click="
              addDaySite()
            "
            >Add Site To Day</v-btn
          >
            </v-col>

          </v-row>
          <v-spacer></v-spacer>
          <v-row  v-if="isEditDay">
            <v-col>
              <v-card class="rounded-lg elevation-5">
                <v-card-title
                  ><v-row align="center">
                    <v-col cols="4"
                      ><v-card-title class="headline">Sites </v-card-title>
                    </v-col>
                    <v-col cols="4"
                      ><v-card-title class="headline">Description </v-card-title>
                    </v-col>
                    <v-col class="d-flex justify-end" cols="4">
                    </v-col>
                  </v-row>
                </v-card-title>
                <v-card-text>
                  <v-list>
                    <v-list-item
                      v-for=" daySite in  daySites"
                      :key=" daySite.id"
                    >
                    <v-row>
                      <v-col cols="4">
                      <b>{{  daySite.site.siteName }}
                        </b>
                      </v-col>
                      <v-col cols="4">
                      <b>{{  daySite.site.siteDescription }}
                        </b>
                        </v-col>
                        <v-col cols="4">
                          </v-col>
                        </v-row>

                      <template v-slot:append>
                        <v-row>
                          <v-icon
                            class="mx-2"
                            size="x-small"
                            icon="mdi-pencil"
                            @click="openEditDaySite( daySite)"
                          ></v-icon>
                          <v-icon
                            class="mx-2"
                            size="x-small"
                            icon="mdi-trash-can"
                            @click="deleteDaySite( daySite)"
                          ></v-icon>
                        </v-row>
                      </template>
                    </v-list-item>
                  </v-list>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
        
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            variant="flat"
            color="secondary"
            @click="
              isAddDay
                ? closeAddDay()
                : isEditDay
                ? closeEditDay()
                : false
            "
            >Close</v-btn
          >
          <v-btn
            variant="flat"
            color="primary"
            @click="
              isAddDay
                ? addDay()
                : isEditDay
                ? updateDay()
                : false
            "
            >{{
              isAddDay
                ? "Add Day"
                : isEditDay
                ? "Update Day"
                : ""
            }}</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- Edit Day Site Dialog -->
    <v-dialog
      persistent
      :model-value="isEditDaySite"
      width="800"
    >
      <v-card class="rounded-lg elevation-5">
        <v-card-title class="headline mb-2">Update Day Site</v-card-title>
        <v-card-text>
          
          <v-row>
            <v-col cols="8">
              <v-select
                v-model="selectedSite"
                :items="sites"
                item-title="siteName"
                item-value="id"
                label="Select Site"
                return-object
                required
              >
                <template slot="item" slot-scope="data">
                  <v-list-tile-content>
                    <v-list-tile-title v-html="data.item.siteName"></v-list-tile-title>
                  </v-list-tile-content>
                </template>
              </v-select>
            </v-col>
          </v-row>
        </v-card-text>
        
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            variant="flat"
            color="secondary"
            @click="closeEditDaySite()"
            >Close</v-btn
          >
          <v-btn
            variant="flat"
            color="primary"
            @click="updateDaySite()"
            >Update Site In Day</v-btn
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
