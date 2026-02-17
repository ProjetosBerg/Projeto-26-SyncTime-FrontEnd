import api from '../../../../../../services/api';

class ServiceRecordType {
  getByAllRecordType(page = 1, search = '', sortBy = '', order = '') {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', '10');

    if (search && search.trim() !== '') {
      params.append('search', search.trim());
    }

    return api.get(`/record-types/userId?${params.toString()}`, {
      params: { sortBy, order }
    });
  }
  getByIdRecordType(id) {
    return api.get(`/record-types/${id}`);
  }

  createRecordType(data) {
    return api.post(`/record-types/create`, data);
  }

  editRecordType(id, data) {
    return api.patch(`/record-types/edit/${id}`, data);
  }

  deleteRecordType(id) {
    return api.delete(`/record-types/delete/${id}`);
  }
}

export default new ServiceRecordType();

