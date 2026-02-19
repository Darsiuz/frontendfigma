import axios from "axios";

const api = axios.create({
  baseURL: "http://darsiuz.ddns.net:9191",
  // baseURL: "http://localhost:8080",

  // withCredentials: true,

});

// interceptor para JWT
api.interceptors.request.use(config => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// interceptor de respuesta para manejar errores de autenticación
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("currentUser");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export default api;