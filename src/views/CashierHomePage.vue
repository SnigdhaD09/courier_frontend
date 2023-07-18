<script setup>
import { onMounted } from "vue";
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import TripCard from "../components/TripCardComponent.vue";
import TripServices from "../services/TripServices.js";
import HotelServices from "../services/HotelServices.js";
import DeliveryServices from "../services/DeliveryServices.js";
import CashierServices from "../services/CashierServices.js";
import CourierServices from "../services/CourierServices.js";
import CustomerServices from "../services/CustomerServices.js";

const route = useRoute();
const router = useRouter();
const trips = ref([]);
const registeredTrips = ref([]);
const deliveries = ref([]);
const sites = ref([]);
const customers = ref([]);
const couriers = ref([]);
const isAdd = ref(false);
const isUpdate = ref(false);
const isAddDelivery = ref(false);
const isUpdateDelivery = ref(false);
const isViewDelivery = ref(false);
const isAddSite = ref(false);
const isUpdateSite = ref(false);
const isConfirmationOpen = ref(false);
const isViewSite = ref(false);
const user = ref(null);
var tempId = null;
var isCashier = ref(false);
const selectedCourier = ref(null);

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
var newDelivery = ref({
  originCustomerId: undefined,
  destinationCustomerId: undefined,
  collectionTime: undefined,
  deliveryTime: undefined,
  blocksEstimate: 0,
  status: 'Pending Pickup',
  chargeEstimate: 0.00,
  assignedCourierId: undefined,
});

onMounted(async () => {
  // console.log(route.params);
  if(route.params.id !== undefined){
    isUpdate.value = true;
  }
  user.value = JSON.parse(localStorage.getItem("user"));
  isCashier.value = user.value.isCashier;
  getCouriers();
  getCustomers();
  getDeliveries();
});

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
  return;
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
async function getDeliveries() {
  await DeliveryServices.getDeliveries()
    .then((response) => {
      deliveries.value = response.data.map(delivery => {
        let cTime = new Date(delivery.collectionTime);
        delivery.collectionTime = cTime.getMonth()+"/"+cTime.getDate()+"/"+cTime.getFullYear()+" "+pad(cTime.getHours(),2)+":"+pad(cTime.getMinutes(),2);
        let dTime = new Date(delivery.deliveryTime);
        delivery.deliveryTime = dTime.getMonth()+"/"+dTime.getDate()+"/"+dTime.getFullYear()+" "+pad(dTime.getHours(),2)+":"+pad(dTime.getMinutes(),2);
        if(delivery.trip){
          delivery.assignedCourierId = delivery.trip.assignedCourierId;
          delivery.oldAssignedCourierId = delivery.trip.assignedCourierId;
        }
        return delivery;
      });
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response.data.message;
    });
}

async function addDelivery() {
  await DeliveryServices.addDelivery(newDelivery.value)
    .then(() => {
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = `Delivery added successfully!`;
      isAddDelivery.value = false;
      getDeliveries();
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response.data.message;
    });
}
async function getDelivery(deliveryId) {
  await DeliveryServices.getDelivery(deliveryId)
    .then((response) => {
      newDelivery.value = response.data;
      newDelivery.value.collectionTime = formatDate(newDelivery.value.collectionTime);
      newDelivery.value.deliveryTime = formatDate(newDelivery.value.deliveryTime);
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response.data.message;
    });
}

async function updateDelivery() {
  await DeliveryServices.updateDelivery(newDelivery.value.id, newDelivery.value)
    .then(() => {
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = `Delivery updated successfully!`;
      isAddDelivery.value = false;
      getDeliveries();
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response.data.message;
    });
}
  
function openConfirmDelete(deleteId){
  isConfirmationOpen.value = true;
  tempId = deleteId;
}

function confirmDeleteYes(){
  deleteDelivery(tempId);
  tempId = null;
  closeConfirmDelete();
}

function closeConfirmDelete(){
  isConfirmationOpen.value = false;
}


async function deleteDelivery(deliveryId) {
  await DeliveryServices.deleteDelivery(deliveryId)
    .then(() => {
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = `Delivery deleted successfully!`;
      isAddDelivery.value = false;
      getDeliveries();
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response.data.message;
    });
}

async function assignCourier(deliveryId, delivery){
  console.log(delivery);
  var courier = delivery.assignedCourierId;
  console.log(2);
  if(delivery.assignedCourierId == delivery.oldAssignedCourierId){
    console.log(3);
    return;
  }
  console.log(4);
  await DeliveryServices.assignCourier(deliveryId, courier)
    .then(() => {
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = `Courier has been assigned successfully!`;
      delivery.oldAssignedCourierId = delivery.assignedCourierId;
      courier = null;
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

async function getSite(siteId) {
  await SiteServices.getSite(siteId)
    .then((response) => {
      newSite.value = response.data;
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response.data.message;
    });
}

async function addSite() {
  await SiteServices.addSite(newSite.value)
    .then(() => {
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = `${newSite.value.siteName} added successfully!`;
      isAddSite.value = false;
      getSites();
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response.data.message;
    });
}

async function updateSite() {
  await SiteServices.updateSite(newSite.value.id, newSite.value)
    .then(() => {
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = `${newSite.value.siteName} updated successfully!`;
      isAddSite.value = false;
      getSites();
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response.data.message;
    });
}
async function deleteSite(siteId, siteName) {
  await SiteServices.deleteSite(siteId)
    .then(() => {
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = `${siteName} deleted successfully!`;
      isAddSite.value = false;
      getSites();
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

function openAddDelivery() {
  closeViewDelivery();
  newDelivery = ref({
  originCustomerId: undefined,
  destinationCustomerId: undefined,
  collectionTime: undefined,
  deliveryTime: undefined,
  blocksEstimate: 0,
  status: 'Pending Pickup',
  chargeEstimate: 0.00,
});
  isAddDelivery.value = true;
}

function closeAddDelivery() {
  isAddDelivery.value = false;
  isUpdateDelivery.value = false;
}
function openUpdateDelivery(deliveryId) {
  openAddDelivery();
  getDelivery(deliveryId);
  isUpdateDelivery.value = true;
}

function openViewDelivery() {
  isViewDelivery.value = true;
}

function closeViewDelivery() {
  isViewDelivery.value = false;
}

function openAddSite() {
  closeViewSite();
  newSite = ref({
    siteName: undefined,
    siteDescription: undefined,
    state: undefined,
    city: undefined,
    siteImage: undefined,
  });
  isAddSite.value = true;
}

function closeAddSite() {
  isAddSite.value = false;
  isUpdateSite.value = false;
}
function openUpdateSite(siteId) {
  getSite(siteId),
  openAddSite();
  isUpdateSite.value = true;
}

function openViewSite() {
  isViewSite.value = true;
}

function closeViewSite() {
  isViewSite.value = false;
}

function closeSnackBar() {
  snackbar.value.value = false;
}
function formatDate (date) {
  if (!date) return null;
  var dateObj = new Date(date);
  date = new Date(date).toISOString().substr(0, 10);
  const [year, month, day] = date.split('-');
  const hours = pad(dateObj.getHours(), 2);
  const minutes = pad(dateObj.getMinutes(), 2);
  var aaa=  `${year}-${month}-${day}T${hours}:${minutes}`;
  console.log(aaa);
  return aaa;
}
function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
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
          ><v-card-title class="pl-0 text-h4 font-weight-bold">Cashier HomePage</v-card-title>
        </v-col>
        <!-- <v-col class="d-flex justify-end" cols="2">
          <v-btn v-if="isAdmin" color="accent" @click="openViewSite()"
            >View Sites</v-btn
          >
        </v-col>-->
        <v-col class="d-flex justify-end" cols="6">
          <v-btn v-if="isCashier" color="accent" @click="openAddDelivery()"
            >Add Delivery</v-btn>
        </v-col>
      </v-row>

      
      <v-card v-if="isCashier" class="rounded-lg elevation-5">
          <v-card-title class="headline mb-2">View Deliveries</v-card-title>
          <v-card-text>
            <v-table>
              <thead>
                <tr>
                  <th>Origin Customer Name</th>
                  <!-- <th>Origin Customer Location</th> -->
                  <th>Destination Customer Name</th>
                  <!-- <th>Destination Customer Delivery</th> -->
                  <th>Requested Collection Time</th>
                  <th>Requested Delivery Time</th>
                  <th>Blocks Estimate</th>
                  <th>Status</th>
                  <th>Charge Estimate</th>
                  <th>Courier</th>
                  <th>Edit</th>
                  <th>Delete</th>
                </tr>
              </thead>
              <tbody>
                <tr  v-for="delivery in deliveries"
                  :key="delivery.id"
                >
                  <td>{{ delivery.originCustomer.name }}</td>
                  <!-- <td>{{ delivery.originCustomer.location }}</td> -->
                  <td>{{ delivery.destinationCustomer.name }}</td>
                  <!-- <td>{{ delivery.destinationCustomer.delivery }}</td> -->
                  <td>{{ delivery.collectionTime }}</td>
                  <td>{{ delivery.deliveryTime }}</td>
                  <td>{{ delivery.blocksEstimate }}</td>
                  <td>{{ delivery.status }}</td>
                  <td>$ {{ delivery.chargeEstimate }}</td>
                  <td>
                    <v-select
              v-model="delivery.assignedCourierId"
              label="Assign Courier"
              placeholder="Select Courier"
              :items="couriers"
              item-title="firstName"
              item-value="id"
              searchable
              :on-change="assignCourier(delivery.id, delivery)"
            > <template slot="item" slot-scope="data">
                  <v-list-tile-content>
                    <v-list-tile-title v-html="data.item.firstName"></v-list-tile-title>
                  </v-list-tile-content>
                </template>
              </v-select>
                  </td>
                  <td><v-btn variant="flat" color="primary" @click="openUpdateDelivery(delivery.id)">Edit</v-btn></td>
                  <td><v-btn variant="flat" color="primary" @click="openConfirmDelete(delivery.id)">Cancel</v-btn></td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn variant="flat" color="primary" @click="openAddDelivery()"
              >Add Delivery</v-btn
            >
          </v-card-actions>
        </v-card>
<!-- Delete Confirmation Dialog-->
        <v-dialog persistent v-model="isConfirmationOpen" width="400">
        <v-card class="rounded-lg elevation-6">
          <v-card-title >Confirm Delete</v-card-title>
          <v-card-text>Are you sure you want to cancel this delivery?</v-card-text>
          <v-card-actions>
            <v-btn variant="flat" color="secondary" @click="closeConfirmDelete()"
              >Close</v-btn
            >
            <v-btn variant="flat" color="primary" @click="confirmDeleteYes()"
              >Yes</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>
<!-- Add Deliveries Dialog-->
      <v-dialog persistent v-model="isAddDelivery" width="800">
        <v-card class="rounded-lg elevation-5">
          <v-card-title v-if="!isUpdateDelivery" class="headline mb-2">Add Delivery</v-card-title>
          <v-card-title v-if="isUpdateDelivery" class="headline mb-2">Update Delivery</v-card-title>
          <v-card-text>
            <v-select
              v-model="newDelivery.originCustomerId"
              label="Origin Customer"
              :items="customers"
              item-title="name"
              item-value="id"
              required
            >
            <template slot="item" slot-scope="data">
                  <v-list-tile-content>
                    <v-list-tile-title v-html="data.item.name"></v-list-tile-title>
                  </v-list-tile-content>
                </template>
          </v-select>
            <v-select
              v-model="newDelivery.destinationCustomerId"
              label="Destination Customer"
              :items="customers"
              item-title="name"
              item-value="id"
              required
            > <template slot="item" slot-scope="data">
                  <v-list-tile-content>
                    <v-list-tile-title v-html="data.item.name"></v-list-tile-title>
                  </v-list-tile-content>
                </template>
              </v-select>
            <v-text-field
              v-model="newDelivery.collectionTime"
              label="Collection Time"
              type="datetime-local"
              required
            ></v-text-field>

            <v-text-field
              v-model="newDelivery.deliveryTime"
              label="Delivery Time"
              type="datetime-local"
              required
            ></v-text-field>
            <v-text-field
              v-model.date="newDelivery.blocksEstimate"
              label="Blocks Estimate"
              type="number"
              required
            ></v-text-field>
            <v-text-field
              v-model.date="newDelivery.status"
              label="Status"
              required
            ></v-text-field>
            <v-text-field
              v-model="newDelivery.chargeEstimate"
              label="Charge Estimate"
              min="1" step="0.01"
              type="number"
              required
            ></v-text-field>
            
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn variant="flat" color="secondary" @click="closeAddDelivery()"
              >Close</v-btn
            >
            <v-btn v-if="!isUpdateDelivery" variant="flat" color="primary" @click="addDelivery()"
              >Add Delivery</v-btn>
              <v-btn v-if="isUpdateDelivery" variant="flat" color="primary" @click="updateDelivery(newDelivery.id)"
              >Update Delivery</v-btn>
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

      <!-- Add Sites Dialog-->
      <v-dialog persistent v-model="isAddSite" width="800">
        <v-card class="rounded-lg elevation-5">
          <v-card-title v-if="!isUpdateSite" class="headline mb-2">Add Site</v-card-title>
          <v-card-title v-if="isUpdateSite" class="headline mb-2">Update Site</v-card-title>
          <v-card-text>
            <v-text-field
              v-model="newSite.siteName"
              label="Site Name"
              required
            ></v-text-field>
            <v-textarea
              v-model="newSite.siteDescription"
              label="Description"
              required
            ></v-textarea>
            <v-text-field
              v-model="newSite.city"
              label="City"
              required
            ></v-text-field>
            <v-text-field
              v-model="newSite.state"
              label="State"
              required
            ></v-text-field>
            <v-text-field
              v-model="newSite.siteImage"
              label="Image Link"
              required
            ></v-text-field>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn variant="flat" color="secondary" @click="closeAddSite()"
              >Close</v-btn
            >
            <v-btn v-if="!isUpdateSite" variant="flat" color="primary" @click="addSite()"
              >Add Site</v-btn>
              <v-btn v-if="isUpdateSite" variant="flat" color="primary" @click="updateSite(newSite.id)"
              >Update Site</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
<!-- View Sites Dialog-->
      <v-dialog persistent v-model="isViewSite" width="800">
        <v-card class="rounded-lg elevation-5">
          <v-card-title class="headline mb-2">View Sites</v-card-title>
          <v-card-text>
            <v-table>
              <thead>
                <tr>
                  <th>Site Name</th>
                  <th>Description</th>
                  <th>City</th>
                  <th>State</th>
                  <th>Image</th>
                  <th>Edit</th>
                  <th>Delete</th>
                </tr>
              </thead>
              <tbody>
                <tr  v-for="site in sites"
                  :key="site.id"
                >
                  <td>{{ site.siteName }}</td>
                  <td>{{ truncateDesc(site.siteDescription, 50)}}...</td>
                  <td>{{ site.city }}</td>
                  <td>{{ site.state }}</td>
                  <td><a :href="site.siteImage" target="_blank"><img :src="site.siteImage" style="height: 40px; width: 50px;"/></a></td>
                  <td><v-btn variant="flat" color="primary" @click="openUpdateSite(site.id)">Edit</v-btn></td>
                  <td><v-btn variant="flat" color="primary" @click="deleteSite(site.id, site.siteName)">Delete</v-btn></td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn variant="flat" color="secondary" @click="closeViewSite()"
              >Close</v-btn
            >
            <v-btn variant="flat" color="primary" @click="openAddSite()"
              >Add Site</v-btn
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
