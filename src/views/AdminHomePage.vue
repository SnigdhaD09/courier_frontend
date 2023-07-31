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
import CostServices from "../services/CostServices.js";
import DeliveryServices from "../services/DeliveryServices";
import { jsPDF } from "jspdf";

const route = useRoute();
const router = useRouter();
const trips = ref([]);
const registeredTrips = ref([]);
const hotels = ref([]);
const cashiers = ref([]);
const couriers = ref([]);
const customers = ref([]);
const costs = ref([]);
const isAdd = ref(false);
const isUpdate = ref(false);
const isAddHotel = ref(false);
const isUpdateHotel = ref(false);
const isOpenGenerateBilling = ref(false);
const isOpenGenerateSalary = ref(false);
const isAddCashier = ref(false);
const isAddCourier = ref(false);
const isUpdateCashier = ref(false);
const isViewCashier = ref(false);
const isUpdateCourier = ref(false);
const isViewCourier = ref(false);
const isAddCustomer = ref(false);
const isUpdateCustomer = ref(false);
const isViewCustomer = ref(false);
const isAddCost = ref(false);
const isUpdateCost = ref(false);
const isViewCost = ref(false);
const user = ref(null);
const selectedCustomer = ref(null);
const selectedCourier = ref(null);
const deliveries = ref([]);
const cdeliveries = ref([]);
const totalCharge = ref(0.00);
const totalBonus = ref(0.00);
const finalBill = ref(0.00);
const ctotalCharge = ref(0.00);
const ctotalBonus = ref(0.00);
const cfinalBill = ref(0.00);
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
var newCost = ref({
  name: undefined,
  price: undefined,
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
  getCosts();
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

async function customerSelected(){
  if(!selectedCustomer.value){
    return null;
  }
  await DeliveryServices.getDeliveriesByCustomer(selectedCustomer.value)
    .then((response) => {
      deliveries.value = [];
      totalCharge.value = 0;
      totalBonus.value = 0;
      finalBill.value = 0;
      for(var i=0; i< response.data.length; i++){
        if(response.data[i].status != "Dropped Off"){
          continue;
        }
        totalCharge.value += parseFloat(response.data[i].chargeEstimate);
        totalBonus.value += parseFloat(response.data[i].trip.deliveredAt <= response.data[i].deliveryTime? (response.data[i].chargeEstimate * 0.1).toFixed(2) : 0.00);
        var temp = response.data[i];
        deliveries.value.push(temp);
      }
      finalBill.value = totalCharge.value + totalBonus.value;
      })
      .catch((error) => {
        console.log(error);
        snackbar.value.value = true;
        snackbar.value.color = "error";
        snackbar.value.text = error.response.data.message;
      });
}

async function courierSelected(){
  if(!selectedCourier.value){
    return null;
  }
  await DeliveryServices.getDeliveriesByCourier(selectedCourier.value)
    .then((cresponse) => {
      cdeliveries.value = [];
      ctotalCharge.value = 0;
      ctotalBonus.value = 0;
      cfinalBill.value = 0;
      for(var i=0; i< cresponse.data.length; i++){
        if(cresponse.data[i].status != "Dropped Off"){
          continue;
        }
        ctotalCharge.value += parseFloat(cresponse.data[i].chargeEstimate);
        ctotalBonus.value += parseFloat(cresponse.data[i].trip.deliveredAt <= cresponse.data[i].deliveryTime? (cresponse.data[i].chargeEstimate * 0.1).toFixed(2) : 0.00);
        var temp = cresponse.data[i];
        cdeliveries.value.push(temp);
      }
      cfinalBill.value = ctotalCharge.value + ctotalBonus.value;
      })
      .catch((error) => {
        console.log(error);
        snackbar.value.value = true;
        snackbar.value.color = "error";
        snackbar.value.text = error.response.data.message;
      });
}

async function getCosts() {
  await CostServices.getCosts()
    .then((response) => {
      costs.value = response.data;
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response.data.message;
    });
}
async function getCost(costId) {
  await CostServices.getCost(costId)
    .then((response) => {
      newCost.value = response.data;
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response.data.message;
    });
}
async function addCost() {
  await CostServices.addCost(newCost.value)
    .then(() => {
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = `${newCost.value.name} added successfully!`;
      isAddCost.value = false;
      getCosts();
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response.data.message;
    });
}

async function updateCost() {
  await CostServices.updateCost(newCost.value.id, newCost.value)
    .then(() => {
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = `${newCost.value.name} updated successfully!`;
      isAddCost.value = false;
      getCosts();
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response.data.message;
    });
}
async function deleteCost(courierId) {
  await CostServices.deleteCost(courierId)
    .then(() => {
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = `Cost deleted successfully!`;
      isAddCost.value = false;
      getCosts();
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

function openGenerateBilling() {
  isOpenGenerateBilling.value = true;
}

function closeGenerateBilling() {
  isOpenGenerateBilling.value = false;
}
function openGenerateSalary() {
  isOpenGenerateSalary.value = true;
}

function closeGenerateSalary() {
  isOpenGenerateSalary.value = false;
}

function generateBillPDF(){
  const doc = new jsPDF({
    orientation: "landscape",
  });
  var html = 
  "<!DOCTYPE html><html><body><h1>Generate &nbsp; Billing</h1>" +
  document.getElementById("billingpdf").innerHTML
  + "<p>Total Bill to Customer: $"+ finalBill.value.toFixed(2) +"</p>"
  + "</body></html>";
  doc.html(html, {
    callback: function(doc) {
        // Save the PDF
        doc.save('billing.pdf');
    },
    x: 10,
    y: 10,
    width: 280, //target width in the PDF document
    windowWidth: 1350 //window width in CSS pixels
  });
}
function generateSalaryPDF(){
  const doc = new jsPDF({
    orientation: "landscape",
  });
  var html = 
  "<!DOCTYPE html><html><body><h1>Generate &nbsp; Salary</h1>" +
  document.getElementById("salarypdf").innerHTML
  + "<p>Total Salary to Courier: $"+ cfinalBill.value.toFixed(2) +"</p>"
  + "</body></html>";
  doc.html(html, {
    callback: function(doc) {
        // Save the PDF
        doc.save('salary.pdf');
    },
    x: 10,
    y: 10,
    width: 280, //target width in the PDF document
    windowWidth: 1750 //window width in CSS pixels
  });
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

function openUpdateCustomer(customerId) {
  getCustomer(customerId),
  openAddCustomer();
  isUpdateCustomer.value = true;
}

function openViewCustomers() {
  isViewCustomer.value = true;
}

function closeViewCustomers() {
  isViewCustomer.value = false;
}

function openAddCost() {
  closeViewCosts();
  newCost = ref({
    name: undefined,
    location: undefined,
    delivery: undefined,
  });
  isAddCost.value = true;
}

function closeAddCost() {
  isAddCost.value = false;
  isUpdateCost.value = false;
}

function openUpdateCost(costId) {
  getCost(costId),
  openAddCost();
  isUpdateCost.value = true;
}

function openViewCosts() {
  isViewCost.value = true;
}

function closeViewCosts() {
  isViewCost.value = false;
}


function closeSnackBar() {
  snackbar.value.value = false;
}
function formatDate (date) {
  if (!date) return null;
  var dateObj = new Date(date);
  date = new Date(date).toISOString().substr(0, 10);
  const [year, month, day] = date.split('-');
  const hours = pad(dateObj.getUTCHours(), 2);
  const minutes = pad(dateObj.getMinutes(), 2);
  return `${year}-${month}-${day} ${hours}:${minutes}`;
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
        <v-col cols="4"
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
        <v-col class="d-flex justify-end" cols="2">
          <v-btn v-if="isAdmin" color="accent" @click="openViewCosts()">
            View Costs</v-btn>
        </v-col>
      </v-row>
      <v-row align="center" class="mb-4">
        <v-col cols="4">
        </v-col>
        <v-col class="d-flex justify-end" cols="4">
          <v-btn v-if="isAdmin" color="accent" @click="openGenerateBilling()"
            >Generate Customer Billing</v-btn
          >
        </v-col>
        <v-col class="d-flex justify-end" cols="4">
          <v-btn v-if="isAdmin" color="accent" @click="openGenerateSalary()">
            Generate Courier Salary
          </v-btn>
        </v-col>
        <!-- <v-col class="d-flex justify-end" cols="2">
          <v-btn v-if="isAdmin" color="accent" @click="openViewCustomers()"
            >View Customers</v-btn
          >
        </v-col>
        <v-col class="d-flex justify-end" cols="2">
          <v-btn v-if="isAdmin" color="accent" @click="openViewCosts()">
            View Costs</v-btn>
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


      <!-- Add Costs Dialog-->
      <v-dialog persistent v-model="isAddCost" width="800">
        <v-card class="rounded-lg elevation-5">
          <v-card-title v-if="!isUpdateCost" class="headline mb-2">Add Cost</v-card-title>
          <v-card-title v-if="isUpdateCost" class="headline mb-2">Update Cost</v-card-title>
          <v-card-text>
            <v-text-field
              v-model="newCost.name"
              label="Cost Name"
              required
            ></v-text-field>
            <v-text-field
              v-model="newCost.price"
              label="Price"
              type="number"
              step="0.01"
              required
            ></v-text-field>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn variant="flat" color="secondary" @click="closeAddCost()"
              >Close</v-btn
            >
            <v-btn v-if="!isUpdateCost" variant="flat" color="primary" @click="addCost()"
              >Add Cost</v-btn>
              <v-btn v-if="isUpdateCost" variant="flat" color="primary" @click="updateCost(newCost.id)"
              >Update Cost</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <!-- View Costs Dialog-->
      <v-dialog persistent v-model="isViewCost" width="800">
        <v-card class="rounded-lg elevation-5">
          <v-card-title class="headline mb-2">View Costs</v-card-title>
          <v-card-text>
            <v-table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Edit</th>
                  <th>Delete</th>
                </tr>
              </thead>
              <tbody>
                <tr  v-for="cost in costs"
                  :key="cost.id"
                >
                  <td>{{ cost.name }}</td>
                  <td>{{ cost.price }}</td>
                  <td><v-btn variant="flat" color="primary" @click="openUpdateCost(cost.id)">Edit</v-btn></td>
                  <td><v-btn variant="flat" color="primary" @click="deleteCost(cost.id)">Delete</v-btn></td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn variant="flat" color="secondary" @click="closeViewCosts()"
              >Close</v-btn
            >
            <v-btn variant="flat" color="primary" @click="openAddCost()"
              >Add Cost</v-btn
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
<!-- View Generate Billing Dialog-->
<v-dialog persistent v-model="isOpenGenerateBilling" width="950" >
        <v-card class="rounded-lg elevation-5">
          <v-card-title class="headline mb-2">Generate Customer Billing</v-card-title>
          <v-card-text>
            <v-select
              v-model="selectedCustomer"
              label="Select Customer"
              :items="customers"
              item-title="name"
              item-value="id"
              required
              searchable
              :on-change="customerSelected()"
            >
            <template slot="item" slot-scope="data">
                  <v-list-tile-content>
                    <v-list-tile-title v-html="data.item.name"></v-list-tile-title>
                  </v-list-tile-content>
                </template>
          </v-select>
          </v-card-text>
          <v-card-text id="billingpdf">
            <v-table>
              <thead>
                <tr>
                  <th>Customer Name</th>
                  <th>Destination Customer Name</th>
                  <th>Location</th>
                  <th>Created At</th>
                  <th>Expected Delivery</th>
                  <th>Delivered At</th>
                  <th>Blocks</th>
                  <th>Charge</th>
                  <th>Bonus</th>
                </tr>
              </thead>
              <tbody>
                <tr  v-for="delivery in deliveries"
                  :key="delivery.id"
                >
                  <td>{{ delivery.originCustomer.name }}</td>
                  <td>{{ delivery.destinationCustomer.name }}</td>
                  <td>{{ delivery.destinationCustomer.location }}</td>
                  <td>{{ formatDate(delivery.destinationCustomer.createdAt) }}</td>
                  <td>{{ formatDate(delivery.deliveryTime) }}</td>
                  <td>{{ formatDate(delivery.trip.deliveredAt) }}</td>
                  <td>{{ delivery.trip.blocksToDestination }}</td>
                  <td>${{ delivery.chargeEstimate }}</td>
                  <td>${{ delivery.trip.deliveredAt <= delivery.deliveryTime? (delivery.chargeEstimate * 0.1).toFixed(2) : "0.00" }}</td>                  
                </tr>
                <tr>
                  <td>Total</td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td>${{ totalCharge.toFixed(2) }}</td>
                  <td>${{ totalBonus.toFixed(2) }}</td>
                </tr>
              </tbody>
            </v-table>
            <v-span style="font-size: small;">* All times are in 24 Hour format</v-span>
          </v-card-text>
          
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn variant="flat" color="secondary" @click="closeGenerateBilling()"
              >Close</v-btn
            >
            <v-btn variant="flat" color="primary" @click="generateBillPDF()"
              >Generate PDF</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>

<!-- View Generate Salary Dialog-->
<v-dialog persistent v-model="isOpenGenerateSalary" width="1200">
        <v-card class="rounded-lg elevation-5">
          <v-card-title class="headline mb-2">Generate Courier Salary</v-card-title>
          <v-card-text>
            <v-select
              v-model="selectedCourier"
              label="Select Courier"
              :items="couriers"
              item-title="firstName"
              item-value="id"
              required
              searchable
              :on-change="courierSelected()"
            >
            <template slot="item" slot-scope="data">
                  <v-list-tile-content>
                    <v-list-tile-title v-html="data.item.firstName"></v-list-tile-title>
                  </v-list-tile-content>
                </template>
          </v-select>
          </v-card-text>
          <v-card-text id="salarypdf">
            <v-table>
              <thead>
                <tr>
                  <th>Courier Name</th>
                  <th>Origin Customer Name</th>
                  <th>Origin Location</th>
                  <th>Destination Customer Name</th>
                  <th>Destination Location</th>
                  <th>Created At</th>
                  <th>Expected Delivery</th>
                  <th>Delivered At</th>
                  <th>Blocks</th>
                  <th>Charge</th>
                  <th>Bonus</th>
                </tr>
              </thead>
              <tbody>
                <tr  v-for="delivery in cdeliveries"
                  :key="delivery.id"
                >
                  <td>{{ delivery.trip.assignedCourier.firstName }} {{ delivery.trip.assignedCourier.lastName }}</td>
                  <td>{{ delivery.originCustomer.name }}</td>
                  <td>{{ delivery.originCustomer.location }}</td>
                  <td>{{ delivery.destinationCustomer.name }}</td>
                  <td>{{ delivery.destinationCustomer.location }}</td>
                  <td>{{ formatDate(delivery.createdAt) }}</td>
                  <td>{{ formatDate(delivery.deliveryTime) }}</td>
                  <td>{{ formatDate(delivery.trip.deliveredAt) }}</td>
                  <td>{{ delivery.trip.blocksToDestination }}</td>
                  <td>${{ delivery.chargeEstimate }}</td>
                  <td>${{ delivery.trip.deliveredAt <= delivery.deliveryTime? (delivery.chargeEstimate * 0.1).toFixed(2) : "0.00" }}</td>                  
                </tr>
                <tr>
                  <td>Total</td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td>${{ ctotalCharge.toFixed(2) }}</td>
                  <td>${{ ctotalBonus.toFixed(2) }}</td>
                </tr>
              </tbody>
            </v-table>
            <v-span style="font-size: small;">* All times are in 24 Hour format</v-span>
          </v-card-text>
          
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn variant="flat" color="secondary" @click="closeGenerateSalary()"
              >Close</v-btn
            >
            <v-btn variant="flat" color="primary" @click="generateSalaryPDF()"
              >Generate PDF</v-btn
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
