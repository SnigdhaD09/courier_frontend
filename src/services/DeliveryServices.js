import apiClient from "./services";

export default {
  getDeliveries() {
    return apiClient.get("deliveries");
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
};
