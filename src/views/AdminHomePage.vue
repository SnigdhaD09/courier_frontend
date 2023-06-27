<script setup>
import { onMounted } from "vue";
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import TripCard from "../components/TripCardComponent.vue";
import TripServices from "../services/TripServices.js";
import HotelServices from "../services/HotelServices.js";
import CashierServices from "../services/CashierServices.js";

const route = useRoute();
const router = useRouter();
const trips = ref([]);
const registeredTrips = ref([]);
const hotels = ref([]);
const cashiers = ref([]);
const isAdd = ref(false);
const isUpdate = ref(false);
const isAddHotel = ref(false);
const isUpdateHotel = ref(false);
const isViewHotel = ref(false);
const isAddCashier = ref(false);
const isUpdateCashier = ref(false);
const isViewCashier = ref(false);
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
var newHotel = ref({
  hotelName: undefined,
  address: undefined,
  website: undefined,
  hotelImage: undefined,
  checkinDate: undefined,
  checkoutDate: undefined,
  phoneNumber: undefined,
});
var newCashier = ref({
  firstName: undefined,
  lastName: undefined,
  email: undefined,
  password: undefined,
  address: undefined,
  phoneNumber: undefined,
});

onMounted(async () => {
  // console.log(route.params);
  if(route.params.id !== undefined){
    isUpdate.value = true;
  }
  user.value = JSON.parse(localStorage.getItem("user"));
  isAdmin.value = user.value.isAdmin;
  getCashiers();
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
        registeredTrips.value = response.data.map(registration => {
          if(!registration.trip.isArchived){
            return registration.trip;
          }
        });
      })
      .catch((error) => {
        console.log(error);
        snackbar.value.value = true;
        snackbar.value.color = "error";
        snackbar.value.text = error.response.data.message;
      });
      await TripServices.getTrips()
      .then((response) => {
        console.log(response);
        var registered = registeredTrips.value.map(trip => {return trip.id;});
        for(var i=0; i< response.data.length; i++){
          if(!registered.includes(response.data[i].id) && !response.data[i].isArchived){
            trips.value.push(response.data[i]);
          }
        }
        
        // console.log(trips);
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

async function getHotel(hotelId) {
  await HotelServices.getHotel(hotelId)
    .then((response) => {
      newHotel.value = response.data;
      newHotel.value.checkinDate = formatDate(newHotel.value.checkinDate);
      newHotel.value.checkoutDate = formatDate(newHotel.value.checkoutDate);
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response.data.message;
    });
}

async function addHotel() {
  await HotelServices.addHotel(newHotel.value)
    .then(() => {
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = `${newHotel.value.hotelName} added successfully!`;
      isAddHotel.value = false;
      getHotels();
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response.data.message;
    });
}

async function updateHotel() {
  await HotelServices.updateHotel(newHotel.value.id, newHotel.value)
    .then(() => {
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = `${newHotel.value.hotelName} updated successfully!`;
      isAddHotel.value = false;
      getHotels();
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response.data.message;
    });
}
async function deleteHotel(hotelId, hotelName) {
  await HotelServices.deleteHotel(hotelId)
    .then(() => {
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = `${hotelName} deleted successfully!`;
      isAddHotel.value = false;
      getHotels();
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response.data.message;
    });
}

async function getCashiers() {
  await CashierServices.getCashiers()
    .then((response) => {
      cashiers.value = response.data;
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response.data.message;
    });
}

async function getCashier(cashierId) {
  await CashierServices.getCashier(cashierId)
    .then((response) => {
      newCashier.value = response.data;
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response.data.message;
    });
}

async function addCashier() {
  await CashierServices.addCashier(newCashier.value)
    .then(() => {
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = `${newCashier.value.firstName} added successfully!`;
      isAddCashier.value = false;
      getCashiers();
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response.data.message;
    });
}

async function updateCashier() {
  await CashierServices.updateCashier(newCashier.value.id, newCashier.value)
    .then(() => {
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = `${newCashier.value.firstName} updated successfully!`;
      isAddCashier.value = false;
      getCashiers();
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response.data.message;
    });
}
async function deleteCashier(cashierId) {
  await CashierServices.deleteCashier(cashierId)
    .then(() => {
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = `Cashier deleted successfully!`;
      isAddCashier.value = false;
      getCashiers();
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
}

function openAddHotel() {
  closeViewHotel();
  newHotel = ref({
    hotelName: undefined,
    address: undefined,
    website: undefined,
    hotelImage: undefined,
    checkinDate: undefined,
    checkoutDate: undefined,
    phoneNumber: undefined,
  });
  isAddHotel.value = true;
}

function closeAddHotel() {
  isAddHotel.value = false;
  isUpdateHotel.value = false;
}
function openUpdateHotel(hotelId) {
  getHotel(hotelId),
  openAddHotel();
  isUpdateHotel.value = true;
}

function openViewHotel() {
  isViewHotel.value = true;
}

function closeViewHotel() {
  isViewHotel.value = false;
}

function openAddCashier() {
  closeViewCashier();
  newCashier = ref({
    firstName: undefined,
    lastName: undefined,
    email: undefined,
    password: undefined,
    address: undefined,
    phoneNumber: undefined,
  });
  isAddCashier.value = true;
}

function closeAddCashier() {
  isAddCashier.value = false;
  isUpdateCashier.value = false;
}
function openUpdateCashier(cashierId) {
  getCashier(cashierId),
  openAddCashier();
  isUpdateCashier.value = true;
}

function openViewCashiers() {
  isViewCashier.value = true;
}

function closeViewCashier() {
  isViewCashier.value = false;
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

function truncateDesc(desc){
  if(desc.length > 20){
    return desc.slice(0,20) + "...";
  }
  return desc;
}

</script>

<template>
  <v-container>
    <div id="body">
      <v-row align="center" class="mb-4">
        <v-col cols="6"
          ><v-card-title class="pl-0 text-h4 font-weight-bold"
            >Admin HomePage
          </v-card-title>
        </v-col>
        <v-col class="d-flex justify-end" cols="2">
          <v-btn v-if="isAdmin" color="accent" @click="openViewCashiers()"
            >View Cashiers</v-btn
          >
        </v-col>
        <!-- <v-col class="d-flex justify-end" cols="2">
          <v-btn v-if="isAdmin" color="accent" @click="openViewHotel()"
            >View Hotels</v-btn
          >
        </v-col> -->
        <!-- <v-col class="d-flex justify-end" cols="2">
          <v-btn v-if="isAdmin" color="accent" @click="openAdd()"
            >Add Trip</v-btn
          >
        </v-col> -->
      </v-row>

      <!-- <v-row v-if="!isAdmin">
        Registered Trips:
      </v-row>
      <v-row>
      <TripCard
        v-for="trip in registeredTrips"
        :key="trip.id"
        :trip="trip"
        @deletedList="getLists()"
      />
    </v-row>
      <v-row v-if="!isAdmin">
        Available Trips:
      </v-row>
      <v-row>
      <TripCard
        v-for="trip in trips"
        :key="trip.id"
        :trip="trip"
        @deletedList="getLists()"
      />
    </v-row> -->
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

      
      <!-- Add Cashiers Dialog-->
      <v-dialog persistent v-model="isAddCashier" width="800">
        <v-card class="rounded-lg elevation-5">
          <v-card-title v-if="!isUpdateCashier" class="headline mb-2">Add Cashier</v-card-title>
          <v-card-title v-if="isUpdateCashier" class="headline mb-2">Update Cashier</v-card-title>
          <v-card-text>
            <v-text-field
              v-model="newCashier.firstName"
              label="First Name"
              required
            ></v-text-field>
            <v-text-field
              v-model="newCashier.lastName"
              label="Last Name"
              required
            ></v-text-field>
            <v-text-field
              v-model="newCashier.address"
              label="Address"
              required
            ></v-text-field>
            <v-text-field
              v-model="newCashier.phoneNumber"
              label="Phone Number"
              required
            ></v-text-field>
            <v-text-field
              v-model="newCashier.email"
              label="Email"
              required
            ></v-text-field>
            <v-text-field
              v-model="newCashier.password"
              type="password"
              label="Password"
              required
            ></v-text-field>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn variant="flat" color="secondary" @click="closeAddCashier()"
              >Close</v-btn
            >
            <v-btn v-if="!isUpdateCashier" variant="flat" color="primary" @click="addCashier()"
              >Add Cashier</v-btn>
              <v-btn v-if="isUpdateCashier" variant="flat" color="primary" @click="updateCashier(newCashier.id)"
              >Update Cashier</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
<!-- View Cashiers Dialog-->
      <v-dialog persistent v-model="isViewCashier" width="800">
        <v-card class="rounded-lg elevation-5">
          <v-card-title class="headline mb-2">View Cashiers</v-card-title>
          <v-card-text>
            <v-table>
              <thead>
                <tr>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Email</th>
                  <th>Address</th>
                  <th>Phone</th>
                  <th>Edit</th>
                  <th>Delete</th>
                </tr>
              </thead>
              <tbody>
                <tr  v-for="cashier in cashiers"
                  :key="cashier.id"
                >
                  <td>{{ cashier.firstName }}</td>
                  <td>{{ cashier.lastName }}</td>
                  <td>{{ cashier.email }}</td>
                  <td>{{ cashier.address }}</td>
                  <td>{{ cashier.phoneNumber }}</td>
                  <td><v-btn variant="flat" color="primary" @click="openUpdateCashier(cashier.id)">Edit</v-btn></td>
                  <td><v-btn variant="flat" color="primary" @click="deleteCashier(cashier.id)">Delete</v-btn></td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn variant="flat" color="secondary" @click="closeViewCashier()"
              >Close</v-btn
            >
            <v-btn variant="flat" color="primary" @click="openAddCashier()"
              >Add Cashier</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>

<!-- Add Hotels Dialog-->
      <v-dialog persistent v-model="isAddHotel" width="800">
        <v-card class="rounded-lg elevation-5">
          <v-card-title v-if="!isUpdateHotel" class="headline mb-2">Add Hotel</v-card-title>
          <v-card-title v-if="isUpdateHotel" class="headline mb-2">Update Hotel</v-card-title>
          <v-card-text>
            <v-text-field
              v-model="newHotel.hotelName"
              label="Hotel Name"
              required
            ></v-text-field>
            <v-textarea
              v-model="newHotel.address"
              label="Address"
              required
            ></v-textarea>
            <v-text-field
              v-model="newHotel.website"
              label="Website"
              required
            ></v-text-field>

            <v-text-field
              v-model="newHotel.hotelImage"
              label="Image Link"
              required
            ></v-text-field>
            <v-text-field
              v-model.date="newHotel.checkinDate"
              label="Checkin Date"
              type="date"
              required
            ></v-text-field>
            <v-text-field
              v-model.date="newHotel.checkoutDate"
              label="Checkout Date"
              type="date"
              required
            ></v-text-field>
            <v-text-field
              v-model="newHotel.phoneNumber"
              label="Phone Number"
              required
            ></v-text-field>
            
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn variant="flat" color="secondary" @click="closeAddHotel()"
              >Close</v-btn
            >
            <v-btn v-if="!isUpdateHotel" variant="flat" color="primary" @click="addHotel()"
              >Add Hotel</v-btn>
              <v-btn v-if="isUpdateHotel" variant="flat" color="primary" @click="updateHotel(newHotel.id)"
              >Update Hotel</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
<!-- View Hotels Dialog-->
      <v-dialog persistent v-model="isViewHotel" width="800">
        <v-card class="rounded-lg elevation-5">
          <v-card-title class="headline mb-2">View Hotels</v-card-title>
          <v-card-text>
            <v-table>
              <thead>
                <tr>
                  <th>Hotel Name</th>
                  <th>Address</th>
                  <th>Website</th>
                  <th>Image</th>
                  <th>CheckIn Date</th>
                  <th>CheckOut Date</th>
                  <th>Phone Number</th>
                  <th>Edit</th>
                  <th>Delete</th>
                </tr>
              </thead>
              <tbody>
                <tr  v-for="hotel in hotels"
                  :key="hotel.id"
                >
                  <td>{{ hotel.hotelName }}</td>
                  <td>{{ hotel.address }}</td>
                  <td>{{ hotel.website }}</td>
                  <td>{{ hotel.hotelImage }}</td>
                  <td>{{ hotel.checkinDate }}</td>
                  <td>{{ hotel.checkoutDate }}</td>
                  <td>{{ hotel.phoneNumber }}</td>
                  
                  <td><v-btn variant="flat" color="primary" @click="openUpdateHotel(hotel.id)">Edit</v-btn></td>
                  <td><v-btn variant="flat" color="primary" @click="deleteHotel(hotel.id, hotel.hotelName)">Delete</v-btn></td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn variant="flat" color="secondary" @click="closeViewHotel()"
              >Close</v-btn
            >
            <v-btn variant="flat" color="primary" @click="openAddHotel()"
              >Add Hotel</v-btn
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
