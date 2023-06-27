import apiClient from "./services";

export default {
  getCashiers() {
    return apiClient.get("users?type=cashiers");
  },
  getCashier(userId) {
    return apiClient.get("users/" + userId);
  },
  addCashier(user) {
    user.isCashier = 1;
    return apiClient.post("users", user);
  },
  updateCashier(userId, user) {
    return apiClient.put("users/" + userId, user);
  },
  deleteCashier(userId) {
    return apiClient.delete("users/" + userId);
  },
};
