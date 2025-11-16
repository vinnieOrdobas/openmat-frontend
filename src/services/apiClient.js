import axios from 'axios';

const API_URL = 'https://openmat-api.onrender.com/api/v1';

const apiClient = axios.create({
  baseURL: API_URL,
});

export default apiClient;