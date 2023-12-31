<script setup>
import { onMounted } from "vue";
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import TripServices from "../services/TripServices.js";
import DeliveryServices from "../services/DeliveryServices.js";
import CashierServices from "../services/CashierServices.js";
import CourierServices from "../services/CourierServices.js";
import CustomerServices from "../services/CustomerServices.js";

const route = useRoute();
const router = useRouter();
const customers = ref([]);
const deliveries = ref([]);
const hotels = ref([]);
const sites = ref([]);
const isAdd = ref(false);
const isUpdate = ref(false);
const isAddHotel = ref(false);
const isUpdateHotel = ref(false);
const isViewDeliveryInstructions = ref(false);
const isAddSite = ref(false);
const isUpdateSite = ref(false);
const isViewSite = ref(false);
const user = ref(null);
var isCourier = ref(false);
const deliveryAccepted = ref(null);
const delivered = ref(null);
const isDeliveredOpen = ref(false);
const selectedLocation = ref(null);
const startNodes = ref([]);
const pickupRoute = ref({});
const deliveryRoute = ref({});

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
var newSite = ref({
  siteName: undefined,
  siteDescription: undefined,
  state: undefined,
  city: undefined,
  siteImage: undefined,
});

onMounted(async () => {
  // console.log(route.params);
  if(route.params.id !== undefined){
    isUpdate.value = true;
  }
  user.value = JSON.parse(localStorage.getItem("user"));
  isCourier.value = user.value.isCourier;

  getCustomers();
  await getDeliveries();
  getStartNodes();
});

function openAcceptDelivery(delivery){
  if(deliveryAccepted.value){
    alert("You cannot accept more than one delivery at a time!");
    return;
  }
  deliveryAccepted.value = delivery;
  var startedAt = new Date();
  startedAt = formatDate(startedAt);
  var newTrip = {
    startedAt: startedAt
  };
  updateTrip(delivery.id, {status: 'Accepted'}, newTrip);
  fetchDeliveryRoute();
}

function openPickedUpDelivery(delivery){
  if(!deliveryAccepted.value){
    alert("You have not accepted a delivery!");
    return;
  }
  // deliveryAccepted.value = delivery;
  var collectedAt = new Date();
  collectedAt = formatDate(collectedAt);
  var newTrip = {
    collectedAt: collectedAt,
    blocksToDestination: deliveryAccepted.value.blocksEstimate,
  };
  updateTrip(delivery.id, {status: 'Picked Up'}, newTrip);
  fetchDeliveryRoute();
}

async function openDroppedOffDelivery(delivery){
  if(!deliveryAccepted.value){
    alert("You have not picked up a delivery!");
    return;
  }
  deliveryAccepted.value = null;
  var deliveredAt = new Date();
  deliveredAt = formatDate(deliveredAt);
  var newTrip = {
    deliveredAt: deliveredAt
  };
  await updateTrip(delivery.id, {status: 'Dropped Off'}, newTrip);
  await getDelivery(delivery.id);
  isDeliveredOpen.value = true;
}

function closeDelivered(){
  isDeliveredOpen.value = false;
}

async function getDelivery(deliveryId){
  await DeliveryServices.getDelivery(deliveryId)
  .then((response) => {
      delivered.value = response.data;
      })
      .catch((error) => {
        console.log(error);
        snackbar.value.value = true;
        snackbar.value.color = "error";
        snackbar.value.text = error.response.data.message;
      });
}

async function fetchDeliveryRoute(){
  await CustomerServices.getRoute(deliveryAccepted.value.originCustomer.location, deliveryAccepted.value.destinationCustomer.location)
    .then((response) => {
      deliveryRoute.value = {
          route: JSON.parse(response.data.route),
          startNode: deliveryAccepted.value.originCustomer.location,
          endNode: deliveryAccepted.value.destinationCustomer.location,
          numOfBlocks: response.data.numOfBlocks,
        };
      })
      .catch((error) => {
        console.log(error);
        snackbar.value.value = true;
        snackbar.value.color = "error";
        snackbar.value.text = error.response.data.message;
      });
}

function cancelDelivery(delivery){
  if(!deliveryAccepted.value){
    return;
  }
  alert("You are now cancelling the pickup!");
  var newTrip = {
    startedAt: null
  };
  updateTrip(delivery.id, {status: 'Pending Pickup'}, newTrip);
  deliveryAccepted.value = null;
}

async function updateTrip(deliveryId, status, newTrip) {
  var updateInfo = {
    newTrip: newTrip,
    newDelivery: status,
  };
  await DeliveryServices.updateTrip(deliveryId, updateInfo)
    .then(() => {
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = `Delivery updated successfully!`;
      getDeliveries();
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
async function getDeliveries() {
  await DeliveryServices.getDeliveries()
    .then((response) => {
      deliveries.value = response.data.map(delivery => {
        let cTime = new Date(delivery.collectionTime);
        delivery.collectionTime = (cTime.getMonth()+1)+"/"+cTime.getUTCDate()+"/"+cTime.getFullYear()+" "+pad(cTime.getUTCHours(),2)+":"+pad(cTime.getMinutes(),2);
        let dTime = new Date(delivery.deliveryTime);
        delivery.deliveryTime = (dTime.getMonth()+1)+"/"+dTime.getUTCDate()+"/"+dTime.getFullYear()+" "+pad(dTime.getUTCHours(),2)+":"+pad(dTime.getMinutes(),2);
        delivery.assignedCourierId = delivery.trip.assignedCourierId;
        delivery.oldAssignedCourierId = delivery.trip.assignedCourierId;
        if(user.value.id == delivery.assignedCourierId){
          if(delivery.status == "Accepted" || delivery.status == "Picked Up"){
            deliveryAccepted.value = delivery;
          }
          return delivery;
        }
      });
      deliveries.value = deliveries.value.filter(function(x) {
        return x !== undefined;
      });
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response.data.message;
    });
}

async function getStartNodes(){
  await CustomerServices.getStartNodes()
    .then((response) => {
        startNodes.value = response.data.map(node => {return node.startNode});
      })
      .catch((error) => {
        console.log(error);
        snackbar.value.value = true;
        snackbar.value.color = "error";
        snackbar.value.text = error.response.data.message;
      });
}

async function locationSelected(){
  if(!selectedLocation.value || (pickupRoute.value != null && selectedLocation.value == pickupRoute.value.startNode)){
    return;
  }
  await CustomerServices.getRoute(selectedLocation.value, deliveryAccepted.value.originCustomer.location)
    .then((response) => {
      pickupRoute.value = {
          route: JSON.parse(response.data.route),
          startNode: selectedLocation.value,
          endNode: deliveryAccepted.value.originCustomer.location,
          numOfBlocks: response.data.numOfBlocks,
        };
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

function openDeliveryInstructions() {
  isViewDeliveryInstructions.value = true;
}

function closeDeliveryInstructions() {
  isViewDeliveryInstructions.value = false;
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
  return `${year}-${month}-${day}T${hours}:${minutes}`;
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
          ><v-card-title class="pl-0 text-h4 font-weight-bold"
            >Courier HomePage
          </v-card-title>
        </v-col>
        <!-- <v-col class="d-flex justify-end" cols="2">
          <v-btn v-if="isAdmin" color="accent" @click="openViewSite()"
            >View Sites</v-btn
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
        </v-col> -->
      </v-row>
      <v-card v-if="isCourier" class="rounded-lg elevation-5">
          <v-card-title class="headline mb-2">View Deliveries</v-card-title>
          <v-card-text>
            <v-table>
              <thead>
                <tr>
                  <th>Origin Customer Name</th>
                  <th>Origin Customer Location</th>
                  <th>Destination Customer Name</th>
                  <th>Destination Customer Location</th>
                  <th>Destination Customer Delivery</th>
                  <th>Requested Collection Time</th>
                  <th>Requested Delivery Time</th>
                  <th>Blocks Estimate</th>
                  <th>Status</th>
                  <th>Charge Estimate</th>
                  <th>Actions</th>
                  <th>Cancel</th>
                </tr>
              </thead>
              <tbody>
                <tr  v-for="delivery in deliveries"
                  :key="delivery.id"
                >
                  <td>{{ delivery.originCustomer.name }}</td>
                  <td>{{ delivery.originCustomer.location }}</td>
                  <td>{{ delivery.destinationCustomer.name }}</td>
                  <td>{{ delivery.destinationCustomer.location }}</td>
                  <td>{{ delivery.destinationCustomer.delivery }}</td>
                  <td>{{ delivery.collectionTime }}</td>
                  <td>{{ delivery.deliveryTime }}</td>
                  <td>{{ delivery.blocksEstimate }}</td>
                  <td>{{ delivery.status }}</td>
                  <td>$ {{ delivery.chargeEstimate }}</td>
                  <td>
                    <v-btn v-if="delivery.status == 'Pending Pickup'" variant="flat" color="primary" @click="openAcceptDelivery(delivery)">Accept</v-btn>
                    <v-btn v-if="delivery.status == 'Accepted'" variant="flat" color="primary" @click="openPickedUpDelivery(delivery)">Picked Up</v-btn>
                    <v-btn v-if="delivery.status == 'Picked Up'" variant="flat" color="primary" @click="openDroppedOffDelivery(delivery)">Dropped Off</v-btn>
                    <v-btn v-if="delivery.status == 'Dropped Off'" variant="flat" color="primary" disabled>Completed</v-btn>
                  </td>
                  <td><v-btn v-if="delivery.status != 'Pending Pickup' && delivery.status != 'Dropped Off'" variant="flat" color="primary" @click="cancelDelivery(delivery)">Cancel</v-btn></td>
                </tr>
              </tbody>
            </v-table>
            
          </v-card-text>
          <v-card-actions>
            <v-span v-if="!deliveries.length">No Deliveries Assigned!</v-span>
            <v-spacer></v-spacer>
            <v-btn v-if="deliveryAccepted" variant="flat" color="primary" @click="openDeliveryInstructions()"
              >View Delivery Instructions</v-btn
            >
          </v-card-actions>
        </v-card>
      
<!-- View Delivery Instructions Dialog-->
      <v-dialog persistent v-model="isViewDeliveryInstructions" width="800">
        <v-card class="rounded-lg elevation-5">
          <v-card-title class="headline mb-2">View Delivery Instructions</v-card-title>
          <v-card-text>
            <v-select
              v-model="selectedLocation"
              label="Select Your Location"
              placeholder="Select Your Location"
              :items="startNodes"
              searchable
              :on-change="locationSelected()"
            > </v-select>
          </v-card-text>
          <v-card-title class="headline mb-2">Pickup Directions</v-card-title>
          <v-card-text>
            <ul v-for="r in pickupRoute.route">
              <li>{{ r }}</li>
            </ul>
          </v-card-text>
          <v-card-title class="headline mb-2">Delivery Directions</v-card-title>
          <v-card-text>
            <ul v-for="r in deliveryRoute.route">
              <li>{{ r }}</li>
            </ul>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn variant="flat" color="secondary" @click="closeDeliveryInstructions()"
              >Close</v-btn
            >
            <!-- <v-btn variant="flat" color="primary" @click="openAddHotel()"
              >Add Hotel</v-btn
            > -->
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- View Delivered Dialog-->
      <v-dialog persistent v-model="isDeliveredOpen" width="800">
        <v-card class="rounded-lg elevation-5">
          <v-card-title class="headline mb-2">Delivered!</v-card-title>
          <v-card-text>
            Congrats on completing the delivery!
          </v-card-text>
          <v-card-text>
            You have earned:
          </v-card-text>
          <v-card-text>
            Delivery Amount: $ {{ delivered.chargeEstimate }}
          </v-card-text>
          <v-card-text>
            On-Time Bonus: $ {{ delivered.trip.deliveredAt <= delivered.deliveryTime? (delivered.chargeEstimate * 0.1).toFixed(2) : "0.00" }}
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn variant="flat" color="secondary" @click="closeDelivered()"
              >Close</v-btn
            >
            <!-- <v-btn variant="flat" color="primary" @click="openAddHotel()"
              >Add Hotel</v-btn
            > -->
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
