// axiosInstance.ts
import axios from 'axios';

// Create an Axios instance
const axiosInstance = axios.create({
  baseURL: 'https://303b-171-253-248-220.ngrok-free.app',  // Replace with your base API URL
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000,  // Set a timeout (optional)
});

export default axiosInstance;
