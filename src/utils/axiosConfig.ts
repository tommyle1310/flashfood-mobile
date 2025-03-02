// axiosInstance.ts
import axios from "axios";

// Create an Axios instance
const axiosInstance = axios.create({
  baseURL: "https://1e81-2001-ee0-50c6-6480-8901-9c4b-fb36-c822.ngrok-free.app", // Replace with your base API URL
  headers: {
    "Content-Type": "application/json",
  },
  // withCredentials: true,
  timeout: 20000, // Set a timeout (optional)
});

export default axiosInstance;
