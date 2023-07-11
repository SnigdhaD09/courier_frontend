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
  deleteDelivery(deliveryId) {
    return apiClient.delete("deliveries/" + deliveryId);
  },
};
