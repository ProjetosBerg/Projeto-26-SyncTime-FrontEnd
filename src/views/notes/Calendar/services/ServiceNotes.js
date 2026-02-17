import api from "../../../../services/api";

class ServiceNotes {
  getByAllNotes() {
    const params = new URLSearchParams();
    

    return api.get(`/notes/userId?${params.toString()}`, {
      params: { isListAll: true },
    });
  }
  getByIdNotes(id) {
    return api.get(`/notes/${id}`);
  }

  createNotes(data) {
    return api.post(`/notes/create`, data);
  }
  generateSummary(data) {
    return api.post(`/notes/create/summary-day`, data);
  }

  editNotes(id, data) {
    return api.patch(`/notes/edit/${id}`, data);
  }

  deleteNotes(id) {
    return api.delete(`/notes/delete/${id}`);
  }
}

export default new ServiceNotes();
