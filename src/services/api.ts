import axios from "axios";

const api = axios.create({
  // baseURL: "http://darsiuz.ddns.net:9191",
  baseURL: "http://localhost:8080",
  withCredentials: true,
});

// interceptor para auth
api.interceptors.request.use(config => {
  const auth = localStorage.getItem("auth"); 
  // auth = "email:password"

  if (auth) {
    config.headers.Authorization =
      "Basic " + btoa(auth);
  }

  return config;
});

export default api;