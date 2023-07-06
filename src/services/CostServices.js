import apiClient from "./services";

export default {
  getCosts() {
    return apiClient.get("costs");
  },
  getCost(costId) {
    return apiClient.get("costs/" + costId);
  },
  addCost(cost) {
    return apiClient.post("costs", cost);
  },
  updateCost(costId, cost) {
    return apiClient.put("costs/" + costId, cost);
  },
  deleteCost(costId) {
    return apiClient.delete("costs/" + costId);
  },
};
