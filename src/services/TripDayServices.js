import apiClient from "./services";

export default {
  getTripDays() {
    return apiClient.get("days");
  },
  getTripDaysForTrip(tripId) {
    return apiClient.get("trips/" + tripId + "/days");
  },
  getTripDay(day) {
    return apiClient.get(
      "trips/" +
        day.tripId +
        "/days/" +
        day.id
    );
  },
  addTripDay(day) {
    return apiClient.post(
      "trips/" + day.tripId + "/days",
      day
    );
  },
  updateTripDay(day) {
    return apiClient.put(
      "trips/" +
      day.tripId +
        "/days/" +
        day.id,
        day
    );
  },
  deleteTripDay(day) {
    return apiClient.delete(
      "trips/" +
      day.tripId +
        "/days/" +
        day.id
    );
  },
};
