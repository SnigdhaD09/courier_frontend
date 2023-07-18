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
const isViewHotel = ref(false);
const isAddSite = ref(false);
const isUpdateSite = ref(false);
const isViewSite = ref(false);
const user = ref(null);
var isCourier = ref(false);
const deliveryAccepted = ref(null);

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
  getDeliveries();
  getShortestPath();
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
        delivery.collectionTime = cTime.getMonth()+"/"+cTime.getDate()+"/"+cTime.getFullYear()+" "+pad(cTime.getHours(),2)+":"+pad(cTime.getMinutes(),2);
        let dTime = new Date(delivery.deliveryTime);
        delivery.deliveryTime = dTime.getMonth()+"/"+dTime.getDate()+"/"+dTime.getFullYear()+" "+pad(dTime.getHours(),2)+":"+pad(dTime.getMinutes(),2);
        delivery.assignedCourierId = delivery.trip.assignedCourierId;
        delivery.oldAssignedCourierId = delivery.trip.assignedCourierId;
        if(user.value.id == delivery.assignedCourierId){
          if(delivery.status == "Accepted"){
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

function getShortestPath(){
  const inputMap = createInputMap();
  var startNode = "3rd Ave and C Street";
  var endNode = "1st Ave and D Street";
  var route = dijkstrasShortestPathAlgorith(inputMap, startNode, endNode);
  console.log(route);
}

function createInputMap(){

  const inputMap = {
    "1st Ave and D Street": {
      "1st Ave and C Street": 3,
      "2nd Ave and D Street": 3,
    },
    "2nd Ave and B Street": {
      "1st Ave and B Street": 3,
      "2nd Ave and A Street": 3,
      "2nd Ave and C Street": 3,
    },
    "2nd Ave and D Street": {
      "1st Ave and D Street": 3,
      "3rd Ave and D Street": 3,
      "2nd Ave and E Street": 3,
      "2nd Ave and C Street": 3,
    },
    "2nd Ave and C Street": {
      "2nd Ave and B Street": 3,
      "3rd Ave and C Street": 3,
      "2nd Ave and D Street": 3,
    },
    "3rd Ave and C Street": {
      "3rd Ave and B Street": 3,
      "4th Ave and C Street": 3,
    },
    "3rd Ave and D Street": {
      "3rd Ave and C Street": 3,
      "2nd Ave and D Street": 3,
      "4th Ave and D Street": 3,
    },
    "3rd Ave and B Street": {
      "3rd Ave and A Street": 3,
      "2nd Ave and B Street": 3,
    },
  };
  return inputMap;
}

function dijkstrasShortestPathAlgorith(inputMap, startNode, endNode){
  var last = {};
  var blocks = {};
  var nontraversed = new Set();
  for (var node in inputMap){
    if(node === startNode){
      blocks[node] = 0;
    }else{
      blocks[node] = Infinity;
    }
    nontraversed.add(node);
  }
  
  while(nontraversed.size){
    var nearestNode = null;
    for (var node of nontraversed){
      if(blocks[nearestNode] > blocks[node] || !nearestNode){
        nearestNode = node;
      }
    }
    if(blocks[nearestNode] == Infinity){
      break;
    }
    if(nearestNode === endNode){
      break;
    }
    for(var neighbor in inputMap[nearestNode]){
      var newBlocks = inputMap[nearestNode][neighbor] + blocks[nearestNode];
      if(blocks[neighbor] > newBlocks){
        blocks[neighbor] = newBlocks;
        last[neighbor] = nearestNode;
      }
    }
    nontraversed.delete(nearestNode);
  }
  var node = endNode;
  var route = [];
  while(node){
    route.push(node);
    node = last[node];
  }
  var correctRoute = route.reverse();
  return correctRoute;
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
