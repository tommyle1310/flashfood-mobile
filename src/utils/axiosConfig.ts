// axiosInstance.ts
import axios from "axios";

// Create an Axios instance
const axiosInstance = axios.create({
  baseURL:
    "https://73fd-2405-4800-5716-1560-f510-80e4-a4dd-d086.ngrok-free.app", // Replace with your base API URL
  headers: {
    "Content-Type": "application/json",
  },
  // withCredentials: true,
  timeout: 20000, // Set a timeout (optional)
});

export default axiosInstance;
