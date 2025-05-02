import axios from "axios";
import { enqueueSnackbar } from "notistack";

export const axiosx = (auth: boolean) => {
  const instance = axios.create();

  instance.interceptors.request.use(
    async config => {
      if (auth) {
        const jwtString = localStorage.getItem("jwt"); // Fetch the token from localStorage
        if (jwtString) {
          const jwt = JSON.parse(jwtString); // Parse only if it's not null
          if (jwt && jwt.token) {
            config.headers.Authorization = `Bearer ${jwt.token}`;
          }
        }
      }
      return config;
    },
    error => Promise.reject(error)
  );

  instance.interceptors.response?.use(
    response => response,
    async error => {
      if (error?.response) {
        if (error.response.status === 401) {
          clearToken();
        }
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

const clearToken = () => {
  localStorage.clear();
  setTimeout(() => {
    window.location.href = "/login";
  }, 3000);
  return enqueueSnackbar(`Anda tidak memiliki akses! Silahkan login kembali!`, {
    anchorOrigin: {
      vertical: "top",
      horizontal: "center",
    },
    variant: "error",
  });
};
