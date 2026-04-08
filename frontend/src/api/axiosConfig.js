import axios from 'axios'

// Hardcode the Render backend URL
const API_BASE_URL = 'https://gestion-stock-k0on.onrender.com'

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  }
})

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token') || localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      localStorage.clear()
      window.location.href = '/login'
    }
    
    // Handle 404 Not Found
    if (error.response?.status === 404) {
      console.error('API Endpoint not found:', error.config?.url)
    }
    
    // Handle network errors
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout:', error.config?.url)
    }
    
    if (!error.response) {
      console.error('Network error - cannot reach server:', error.message)
    }
    
    return Promise.reject(error)
  }
)

// Helper method to check if API is reachable
export const checkApiHealth = async () => {
  try {
    const response = await api.get('/health')
    return response.status === 200
  } catch (error) {
    console.error('API health check failed:', error.message)
    return false
  }
}

// Helper to get the base URL (useful for debugging)
export const getApiBaseUrl = () => api.defaults.baseURL

export default api