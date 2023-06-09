// axiosInstance.js
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://genius-chain.netlify.app", // Replace with your API base URL
  // timeout: 120000, // Set a timeout for requests (in milliseconds)
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor (optional)
axiosInstance.interceptors.request.use(config => {
  // Add a field to the body of all POST requests
  if (localStorage.getItem("signedMessage")) {
    let result = localStorage.getItem("signedMessage");
    console.log(result, "result");
    if (result) {
      let { message, signature } = JSON.parse(result);
      if (config.method === "post") {
        if (message && signature) {
          config.data = {
            ...config.data,
            message,
            signature,
          };
        }
      }
    }
  }

  return config;
});

export default axiosInstance;
