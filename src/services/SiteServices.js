import apiClient from "./services";

export default {
  getSites() {
    return apiClient.get("sites");
  },
  getSite(id) {
    return apiClient.get("sites/" + id);
  },
  addSite(site) {
    return apiClient.post("sites", site);
  },
  updateSite(siteId, site) {
    return apiClient.put("sites/" + siteId, site);
  },
  deleteSite(siteId) {
    return apiClient.delete("sites/" + siteId);
  },
};
