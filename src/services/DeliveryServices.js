import apiClient from "./services";

export default {
  getDeliveries() {
    return apiClient.get("deliveries");
  },
  getDeliveriesByCustomer(customerId) {
    return apiClient.get("deliveries/customer/" + customerId);
  },
  getDelivery(id) {
    return apiClient.get("deliveries/" + id);
  },
  addDelivery(delivery) {
    return apiClient.post("deliveries", delivery);
  },
  updateDelivery(deliveryId, delivery) {
    return apiClient.put("deliveries/" + deliveryId, delivery);
  },
  assignCourier(deliveryId, courierId) {
    return apiClient.put("deliveries/" + deliveryId + "/assigncourier/" + courierId);
  },
  deleteDelivery(deliveryId) {
    return apiClient.delete("deliveries/" + deliveryId);
  },
  updateTrip(deliveryId, updateInfo) {
    return apiClient.put("deliveries/" + deliveryId + "/status", updateInfo);
  },
};
