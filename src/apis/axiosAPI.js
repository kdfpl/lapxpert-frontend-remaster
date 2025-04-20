import axios from "axios";

const DEFAULT_TIMEOUT = 10000;

const commonConfig = {
  baseURL: "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: DEFAULT_TIMEOUT,
  withCredentials: false
};

export const publicApi = axios.create({
  ...commonConfig,
  baseURL: commonConfig.baseURL
});

export const privateApi = axios.create({
  ...commonConfig,
  baseURL: `${commonConfig.baseURL}/v1`
});

privateApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn("No token found - redirecting to login");
      window.location.href = "/login";
      return Promise.reject(new Error("Missing authentication token"));
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const handleError = (error) => {
  let errorMessage = 'An unexpected error occurred';
  
  if (error.response) {
    // Server responded with status code outside 2xx
    errorMessage = error.response.data?.message || error.response.statusText;
    
    if (error.response.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login?expired=true";
    }
  } else if (error.request) {
    // Request was made but no response received
    errorMessage = error.code === 'ECONNABORTED' 
      ? 'Request timeout' 
      : 'Network Error';
  }
  
  console.error("API Error:", errorMessage);
  return Promise.reject({
    message: errorMessage,
    status: error.response?.status,
    code: error.code,
    originalError: error
  });
};

[publicApi, privateApi].forEach(instance => {
  instance.interceptors.response.use(
    response => response,
    handleError
  );
});

export default {
  public: publicApi,
  private: privateApi
};