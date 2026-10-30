import api from "../../../services/api";

class ServiceNotification {
  getByAllNotification() {
    return api.get('/notification/userId', {
      params: { page: 1, limit: 100, order: 'DESC' }
    });
  }
  getByIdNotification(id) {
    return api.get(`/notification/${id}`);
  }


  markReadNotification(ids) {
    return api.patch(`/notification/mark-read`, ids);
  }

  deleteNotification(ids) {
    return api.post(`/notification/delete`,ids);
  }
  getCountNotification() {
    return api.get(`/notification/count/new-notification`);
  }
  updateAllNotificationNew() {
    return api.put(`/notification/mark-read-new-notification-all`);
  }
}

export default new ServiceNotification();
