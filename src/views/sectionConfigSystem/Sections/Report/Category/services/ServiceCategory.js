import api from '../../../../../../services/api';

class ServiceCategory {
  getByAllCategory(page = 1, search = '', sortBy = '', order = '') {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', '10');

    if (search && search.trim() !== '') {
      params.append('search', search.trim());
    }

    return api.get(`/category/UserId?${params.toString()}`, {
      params: { sortBy, order }
    });
  }
  getByAllSideBarCategory(isSideBar= true) {
    return api.get(`/category/UserId`,{params:{isSideBar}});
  }
  getByIdCategory(id) {
    return api.get(`/category/${id}`);
  }

  createCategory(data) {
    return api.post(`/category/create`, data);
  }

  editCategory(id, data) {
    return api.patch(`/category/edit/${id}`, data);
  }

  deleteCategory(id) {
    return api.delete(`/category/delete/${id}`);
  }
}

export default new ServiceCategory();
