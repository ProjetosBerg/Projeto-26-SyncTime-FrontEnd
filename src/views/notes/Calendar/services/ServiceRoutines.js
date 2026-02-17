import api from "../../../../services/api";

class ServiceRoutines {
  getByAllRoutines(year, month) {
    return api.get(`/routines/userId`, {
      params: { 
        isCalendar: true, 
        year,
        month 
      },
    });
  }
  getByIdRoutines(id) {
    return api.get(`/routines/${id}`);
  }

  createRoutines(data) {
    return api.post(`/routines/create`, data);
  }

  editRoutines(id, data) {
    return api.patch(`/routines/edit/${id}`, data);
  }

  deleteRoutines(id) {
    return api.delete(`/routines/delete/${id}`);
  }
}

export default new ServiceRoutines();
