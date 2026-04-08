import axios from 'axios'

// Hardcode the Render backend URL
const API_BASE_URL = 'https://gestion-stock-k0on.onrender.com'

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`
  // Remove the VITE_API_URL logic temporarily
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token') || localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api