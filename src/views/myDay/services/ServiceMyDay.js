import api from '../../../services/api';

class ServiceMyDay {
  getByDate(date) {
    return api.get('/my-day', { params: { date } });
  }
}

export default new ServiceMyDay();
