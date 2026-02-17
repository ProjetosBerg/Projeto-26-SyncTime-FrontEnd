import api from "../../../services/api";

class ServiceDashboard {
   getDashboardCategory(page = 1, sortBy = '', order = '',  categoryId, groupBy, startDate, endDate) {
    const params = new URLSearchParams();
    params.append('page', page.toString());

   
    return api.get(`/dashboard/category?${params.toString()}`, {
      params: { sortBy, order, categoryId , groupBy, startDate, endDate },
    });
  }
}

export default new ServiceDashboard();
