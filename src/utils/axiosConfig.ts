// axiosInstance.ts
import axios from "axios";

// Create an Axios instance
const axiosInstance = axios.create({
  baseURL: "https://b22f-2001-ee0-50c6-6480-4d1c-604f-530b-6a75.ngrok-free.app", // Replace with your base API URL
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 20000, // Set a timeout (optional)
});

export default axiosInstance;
