import apiClient from "./services";

export default {
  getDaySitesForDay(dayId) {
    return apiClient.get("days/" + dayId + "/daysites");
  },
  getDaySite(daySite) {
    return apiClient.get(
      "days/" +
        day.dayId +
        "/daysites/" +
        daySite.id
    );
  },
  addDaySite(daySite) {
    return apiClient.post(
      "days/" + daySite.dayId + "/daysites",
      daySite
    );
  },
  updateDaySite(daySite) {
    return apiClient.put(
      "days/" +
      daySite.dayId +
        "/daysites/" +
        daySite.id,
        daySite
    );
  },
  deleteDaySite(daySite) {
    return apiClient.delete(
      "days/" +
      daySite.dayId +
        "/daysites/" +
        daySite.id
    );
  },
};
