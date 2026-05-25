import axios from 'axios';

const BASE_URL = 'http://192.168.1.100:8080/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    Accept: 'application/json',
  },
});

export default api;
