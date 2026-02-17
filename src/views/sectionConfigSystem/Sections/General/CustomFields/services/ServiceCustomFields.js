import api from '../../../../../../services/api';

class ServiceCustomFields {
  getByAllCustomFields(page = 1, search = '', sortBy = '', order = '') {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', '10');

    if (search && search.trim() !== '') {
      params.append('search', search.trim());
    }

    return api.get(`/custom-fields/userId?${params.toString()}`, {
      params: { sortBy, order }
    });
  }

  getByAllByRecordType(categoryId, recordTypeId) {
    return api.get(`/custom-fields/get-by-record-type`, {
      params: { categoryId, recordTypeId }
    });
  }
  getByIdCustomFields(id) {
    return api.get(`/custom-fields/${id}`);
  }

  createCustomFields(data) {
    return api.post(`/custom-fields/create`, data);
  }

  editCustomFields(id, data) {
    return api.patch(`/custom-fields/edit/${id}`, data);
  }

  deleteCustomFields(id) {
    return api.delete(`/custom-fields/delete/${id}`);
  }
}

export default new ServiceCustomFields();
