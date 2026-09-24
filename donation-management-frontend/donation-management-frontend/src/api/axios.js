import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('dh_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url?.endsWith('/auth/login')

    if (error.response?.status === 401 && !isLoginRequest) {
      localStorage.removeItem('dh_token')
      localStorage.removeItem('dh_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

export default api