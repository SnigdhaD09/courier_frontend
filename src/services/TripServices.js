import apiClient from "./services";

export default {
  getTrips() {
    return apiClient.get("trips");
  },
  getRegisteredTripsByUserId(userId) {
    return apiClient.get("trips/registered/" + userId);
  },
  getTrip(id) {
    return apiClient.get("trips/" + id);
  },
  addTrip(trip) {
    return apiClient.post("trips", trip);
  },
  copyTrip(tripId) {
    return apiClient.get("trips/" + tripId + "/copy");
  },
  shareTrip(tripId, email) {
    return apiClient.post("trips/" + tripId + "/share", email);
  },
  checkFavorite(userId, tripId) {
    return apiClient.get("trips/favorite/" + userId +"/"+ tripId);
  },
  markFavorite(userId, tripId) {
    return apiClient.post("trips/favorite", {userId: userId, tripId: tripId});
  },
  markNotFavorite(userId, tripId) {
    return apiClient.post("trips/notfavorite", {userId: userId, tripId: tripId});
  },
  registerForTrip(userId, tripId) {
    return apiClient.post("trips/register", {userId: userId, tripId: tripId});
  },
  unregisterForTrip(userId, tripId) {
    return apiClient.post("trips/unregister", {userId: userId, tripId: tripId});
  },
  updateTrip(tripId, trip) {
    return apiClient.put("trips/" + tripId, trip);
  },
  deleteTrip(tripId) {
    return apiClient.delete("trips/" + tripId);
  },
};
