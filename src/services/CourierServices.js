import apiClient from "./services";

export default {
  getCouriers() {
    return apiClient.get("users?type=couriers");
  },
  getCourier(userId) {
    return apiClient.get("users/" + userId);
  },
  addCourier(user) {
    user.isCourier = 1;
    return apiClient.post("users", user);
  },
  updateCourier(userId, user) {
    return apiClient.put("users/" + userId, user);
  },
  deleteCourier(userId) {
    return apiClient.delete("users/" + userId);
  },
};
