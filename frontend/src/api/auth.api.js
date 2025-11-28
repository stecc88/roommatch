import axios from './axios.config'

const authApi = {
  login: (data) => axios.post('/auth/login', data),
  register: (data) => {
    const isFormData = typeof FormData !== 'undefined' && data instanceof FormData
    const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined
    return axios.post('/auth/register', data, config)
  },
  logout: () => axios.post('/auth/logout'),
  getProfile: () => axios.get('/auth/me'),
  updateProfile: (data) => axios.put('/users', data),
  forgotPassword: (email) => axios.post('/auth/forgot-password', { email }),
  resetPassword: (data) => axios.post('/auth/reset-password', data),
}

export default authApi
