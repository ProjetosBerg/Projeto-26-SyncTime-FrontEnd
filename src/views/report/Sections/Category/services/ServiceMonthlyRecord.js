import api from '../../../../../services/api';
class ServiceMonthlyRecord {
  getByAllMonthlyRecord(page = 1, sortBy = '', order = '', filters = [], categoryId) {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', '10');

    if (filters && filters.length > 0) {
      params.append('filters', JSON.stringify(filters));
    }

    return api.get(`/monthly-record/userId?${params.toString()}`, {
      params: { sortBy, order, categoryId }
    });
  }
  getByIdMonthlyRecord(id) {
    return api.get(`/monthly-record/${id}`);
  }

  createMonthlyRecord(data) {
    return api.post(`/monthly-record/create`, data);
  }

  editMonthlyRecord(id, data) {
    return api.patch(`/monthly-record/edit/${id}`, data);
  }

  deleteMonthlyRecord(id) {
    return api.delete(`/monthly-record/delete/${id}`);
  }
}

export default new ServiceMonthlyRecord();
