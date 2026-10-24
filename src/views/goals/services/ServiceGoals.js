import api from '../../../services/api';

class ServiceGoals {
  list() { return api.get('/goals'); }
  create(data) { return api.post('/goals', data); }
  update(id, data) { return api.patch(`/goals/${id}`, data); }
  delete(id) { return api.delete(`/goals/${id}`); }
}
export default new ServiceGoals();
