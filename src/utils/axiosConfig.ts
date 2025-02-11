// axiosInstance.ts
import axios from "axios";

// Create an Axios instance
const axiosInstance = axios.create({
  baseURL: "https://1afb-2001-ee0-50c6-6480-ec74-4ea9-daf5-d77d.ngrok-free.app", // Replace with your base API URL
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 20000, // Set a timeout (optional)
});

export default axiosInstance;
