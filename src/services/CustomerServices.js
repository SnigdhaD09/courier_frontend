import apiClient from "./services";

export default {
  getCustomers() {
    return apiClient.get("customers");
  },
  getCustomer(customerId) {
    return apiClient.get("customers/" + customerId);
  },
  addCustomer(customer) {
    return apiClient.post("customers", customer);
  },
  updateCustomer(customerId, customer) {
    return apiClient.put("customers/" + customerId, customer);
  },
  deleteCustomer(customerId) {
    return apiClient.delete("customers/" + customerId);
  },
  getStartNodes() {
    return apiClient.get("customers/startnodes");
  },
  getRoute(startNode, endNode){
    return apiClient.post("customers/route/", {startNode: startNode,endNode: endNode});
  },
};
