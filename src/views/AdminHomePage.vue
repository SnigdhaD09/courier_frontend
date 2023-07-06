<script setup>
import { onMounted } from "vue";
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import TripCard from "../components/TripCardComponent.vue";
import TripServices from "../services/TripServices.js";
import HotelServices from "../services/HotelServices.js";
import CashierServices from "../services/CashierServices.js";
import CourierServices from "../services/CourierServices.js";
import CustomerServices from "../services/CustomerServices.js";

const route = useRoute();
const router = useRouter();
const trips = ref([]);
const registeredTrips = ref([]);
const hotels = ref([]);
const cashiers = ref([]);
const couriers = ref([]);
const customers = ref([]);
const isAdd = ref(false);
const isUpdate = ref(false);
const isAddHotel = ref(false);
const isUpdateHotel = ref(false);
const isViewHotel = ref(false);
const isAddCashier = ref(false);
const isAddCourier = ref(false);
const isUpdateCashier = ref(false);
const isViewCashier = ref(false);
const isUpdateCourier = ref(false);
const isViewCourier = ref(false);
const isAddCustomer = ref(false);
const isUpdateCustomer = ref(false);
const isViewCustomer = ref(false);
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
var newCourier = ref({
  firstName: undefined,
  lastName: undefined,
  email: undefined,
  password: undefined,
  address: undefined,
  phoneNumber: undefined,
});
var newCustomer = ref({
  name: undefined,
  location: undefined,
  delivery: undefined,
});

onMounted(async () => {
  // console.log(route.params);
  if(route.params.id !== undefined){
    isUpdate.value = true;
  }
  user.value = JSON.parse(localStorage.getItem("user"));
  isAdmin.value = user.value.isAdmin;
  getCashiers();
  getCouriers();
  getCustomers();
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

async function getCouriers() {
  await CourierServices.getCouriers()
    .then((response) => {
      couriers.value = response.data;
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response.data.message;
    });
}
async function getCourier(courierId) {
  await CourierServices.getCourier(courierId)
    .then((response) => {
      newCourier.value = response.data;
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response.data.message;
    });
}
async function addCourier() {
  await CourierServices.addCourier(newCourier.value)
    .then(() => {
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = `${newCourier.value.firstName} added successfully!`;
      isAddCourier.value = false;
      getCouriers();
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response.data.message;
    });
}

async function updateCourier() {
  await CourierServices.updateCourier(newCourier.value.id, newCourier.value)
    .then(() => {
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = `${newCourier.value.firstName} updated successfully!`;
      isAddCourier.value = false;
      getCouriers();
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response.data.message;
    });
}
async function deleteCourier(courierId) {
  await CourierServices.deleteCourier(courierId)
    .then(() => {
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = `Courier deleted successfully!`;
      isAddCourier.value = false;
      getCouriers();
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response.data.message;
    });
}

async function getCustomers() {
  await CustomerServices.getCustomers()
    .then((response) => {
      customers.value = response.data;
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response.data.message;
    });
}
async function getCustomer(courierId) {
  await CustomerServices.getCustomer(courierId)
    .then((response) => {
      newCustomer.value = response.data;
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response.data.message;
    });
}
async function addCustomer() {
  await CustomerServices.addCustomer(newCustomer.value)
    .then(() => {
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = `${newCustomer.value.name} added successfully!`;
      isAddCustomer.value = false;
      getCustomers();
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response.data.message;
    });
}

async function updateCustomer() {
  await CustomerServices.updateCustomer(newCustomer.value.id, newCustomer.value)
    .then(() => {
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = `${newCustomer.value.name} updated successfully!`;
      isAddCustomer.value = false;
      getCustomers();
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response.data.message;
    });
}
async function deleteCustomer(courierId) {
  await CustomerServices.deleteCustomer(courierId)
    .then(() => {
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = `Customer deleted successfully!`;
      isAddCustomer.value = false;
      getCustomers();
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

function openAddCourier() {
  closeViewCourier();
  newCourier = ref({
    firstName: undefined,
    lastName: undefined,
    email: undefined,
    password: undefined,
    address: undefined,
    phoneNumber: undefined,
  });
  isAddCourier.value = true;
}

function closeAddCourier() {
  isAddCourier.value = false;
  isUpdateCourier.value = false;
}

function openUpdateCourier(courierId) {
  getCourier(courierId),
  openAddCourier();
  isUpdateCourier.value = true;
}

function openViewCouriers() {
  isViewCourier.value = true;
}

function closeViewCourier() {
  isViewCourier.value = false;
}
function openAddCustomer() {
  closeViewCustomers();
  newCustomer = ref({
    name: undefined,
    location: undefined,
    delivery: undefined,
  });
  isAddCustomer.value = true;
}

function closeAddCustomer() {
  isAddCustomer.value = false;
  isUpdateCustomer.value = false;
}

function openUpdateCustomer(courierId) {
  getCustomer(courierId),
  openAddCustomer();
  isUpdateCustomer.value = true;
}

function openViewCustomers() {
  isViewCustomer.value = true;
}

function closeViewCustomers() {
  isViewCustomer.value = false;
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
        <v-col class="d-flex justify-end" cols="2">
          <v-btn v-if="isAdmin" color="accent" @click="openViewCouriers()"
            >View Couriers</v-btn
          >
        </v-col>
        <v-col class="d-flex justify-end" cols="2">
          <v-btn v-if="isAdmin" color="accent" @click="openViewCustomers()"
            >View Customers</v-btn
          >
        </v-col>
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
<!-- Add Couriers Dialog-->
<v-dialog persistent v-model="isAddCourier" width="800">
        <v-card class="rounded-lg elevation-5">
          <v-card-title v-if="!isUpdateCourier" class="headline mb-2">Add Courier</v-card-title>
          <v-card-title v-if="isUpdateCourier" class="headline mb-2">Update Courier</v-card-title>
          <v-card-text>
            <v-text-field
              v-model="newCourier.firstName"
              label="First Name"
              required
            ></v-text-field>
            <v-text-field
              v-model="newCourier.lastName"
              label="Last Name"
              required
            ></v-text-field>
            <v-text-field
              v-model="newCourier.address"
              label="Address"
              required
            ></v-text-field>
            <v-text-field
              v-model="newCourier.phoneNumber"
              label="Phone Number"
              required
            ></v-text-field>
            <v-text-field
              v-model="newCourier.email"
              label="Email"
              required
            ></v-text-field>
            <v-text-field
              v-model="newCourier.password"
              type="password"
              label="Password"
              required
            ></v-text-field>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn variant="flat" color="secondary" @click="closeAddCourier()"
              >Close</v-btn
            >
            <v-btn v-if="!isUpdateCourier" variant="flat" color="primary" @click="addCourier()"
              >Add Courier</v-btn>
              <v-btn v-if="isUpdateCourier" variant="flat" color="primary" @click="updateCourier(newCourier.id)"
              >Update Courier</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- View Couriers Dialog-->
      <v-dialog persistent v-model="isViewCourier" width="800">
        <v-card class="rounded-lg elevation-5">
          <v-card-title class="headline mb-2">View Couriers</v-card-title>
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
                <tr  v-for="courier in couriers"
                  :key="courier.id"
                >
                  <td>{{ courier.firstName }}</td>
                  <td>{{ courier.lastName }}</td>
                  <td>{{ courier.email }}</td>
                  <td>{{ courier.address }}</td>
                  <td>{{ courier.phoneNumber }}</td>
                  <td><v-btn variant="flat" color="primary" @click="openUpdateCourier(courier.id)">Edit</v-btn></td>
                  <td><v-btn variant="flat" color="primary" @click="deleteCourier(courier.id)">Delete</v-btn></td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn variant="flat" color="secondary" @click="closeViewCourier()"
              >Close</v-btn
            >
            <v-btn variant="flat" color="primary" @click="openAddCourier()"
              >Add Courier</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Add Customers Dialog-->
      <v-dialog persistent v-model="isAddCustomer" width="800">
        <v-card class="rounded-lg elevation-5">
          <v-card-title v-if="!isUpdateCustomer" class="headline mb-2">Add Customer</v-card-title>
          <v-card-title v-if="isUpdateCustomer" class="headline mb-2">Update Customer</v-card-title>
          <v-card-text>
            <v-text-field
              v-model="newCustomer.name"
              label="Customer Name"
              required
            ></v-text-field>
            <v-text-field
              v-model="newCustomer.location"
              label="Location"
              required
            ></v-text-field>
            <v-text-field
              v-model="newCustomer.delivery"
              label="Delivery"
              required
            ></v-text-field>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn variant="flat" color="secondary" @click="closeAddCustomer()"
              >Close</v-btn
            >
            <v-btn v-if="!isUpdateCustomer" variant="flat" color="primary" @click="addCustomer()"
              >Add Customer</v-btn>
              <v-btn v-if="isUpdateCustomer" variant="flat" color="primary" @click="updateCustomer(newCustomer.id)"
              >Update Customer</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <!-- View Customers Dialog-->
      <v-dialog persistent v-model="isViewCustomer" width="800">
        <v-card class="rounded-lg elevation-5">
          <v-card-title class="headline mb-2">View Customers</v-card-title>
          <v-card-text>
            <v-table>
              <thead>
                <tr>
                  <th>Customer Name</th>
                  <th>Location</th>
                  <th>Delivery</th>
                  <th>Edit</th>
                  <th>Delete</th>
                </tr>
              </thead>
              <tbody>
                <tr  v-for="customer in customers"
                  :key="customer.id"
                >
                  <td>{{ customer.name }}</td>
                  <td>{{ customer.location }}</td>
                  <td>{{ customer.delivery }}</td>
                  <td><v-btn variant="flat" color="primary" @click="openUpdateCustomer(customer.id)">Edit</v-btn></td>
                  <td><v-btn variant="flat" color="primary" @click="deleteCustomer(customer.id)">Delete</v-btn></td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn variant="flat" color="secondary" @click="closeViewCustomers()"
              >Close</v-btn
            >
            <v-btn variant="flat" color="primary" @click="openAddCustomer()"
              >Add Customer</v-btn
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
