import api from './api';

class ServiceUSERS {
 
  getByUser(id){
    return api.get(`/user/find-user/${id}`);
  }

  getPresence(month = null, year = null){
    const params = new URLSearchParams({
      month: month !== null ? month : (new Date().getMonth() + 1),
      year: year !== null ? year : new Date().getFullYear()
    });
    return api.get(`/user/get-presence?${params.toString()}`);
  }

  getStreak(){
    return api.get(`/user/get-streak`);
  }

  editUser(id, data){
    const config = data instanceof FormData ? {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    } : {};
    return api.patch(`/user/edit/${id}`, data, config);
  }

  deleteUser(id){
    return api.delete(`/user/delete/${id}`);
  }

  getInbox(){
    return api.get(`/user/inbox`);
  }
  
  getRanking(){
    return api.get(`/user/rank`);
  }
}

export default new ServiceUSERS();
