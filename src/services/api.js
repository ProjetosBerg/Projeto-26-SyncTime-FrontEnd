import axios from 'axios';

const defaultApiUrl = import.meta.env.PROD
  ? 'https://projeto-26-synctime-backend.onrender.com/api/'
  : 'http://localhost:3000/api/';

export default axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || defaultApiUrl,
  withCredentials: true
});
