import axios from 'axios'
// Configura Axios con baseURL, auth y manejo de errores

const RAW_API_URL = import.meta.env.VITE_API_URL || '/api'
const API_URL = RAW_API_URL.startsWith('http')
  ? (RAW_API_URL.endsWith('/api') ? RAW_API_URL : RAW_API_URL.replace(/\/$/, '') + '/api')
  : RAW_API_URL

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    if (
      error.response?.status === 404 &&
      typeof error.config?.url === 'string' &&
      error.config.url.includes('/users')
    ) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default axiosInstance
