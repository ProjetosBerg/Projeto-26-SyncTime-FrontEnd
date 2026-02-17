import api from './api';

class ServiceAUTH {
  login(data) {
    return api.post(`/user/login`, data);
  }
  logout(data) {
    return api.post(`/user/logout`, data);
  }

  register(data) {
    return api.post(`/user/register`, data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }

  forgotPassword(data) {
    return api.patch(`/user/forgot-password`, data);
  }

  getFindQuestionByUser(data){
    const queryParam = encodeURIComponent(data);
    return api.get(`/user/find-questions?login=${queryParam}`);
  
  }

}

export default new ServiceAUTH();
