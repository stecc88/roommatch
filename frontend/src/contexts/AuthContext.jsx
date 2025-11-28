import { createContext, useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import authApi from '../api/auth.api'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const response = await authApi.getProfile()
        setUser(response.data)
        setIsAuthenticated(true)
      } catch (error) {
        localStorage.removeItem('token')
        setIsAuthenticated(false)
      }
    }
    setLoading(false)
  }

  const login = async (email, password) => {
    try {
      const response = await authApi.login({ email, password })
      const { user, token } = response.data
      localStorage.setItem('token', token)
      setUser(user)
      setIsAuthenticated(true)
      toast.success('¡Bienvenido de vuelta!')
      navigate('/discover')
      return { success: true }
    } catch (error) {
      const err = error?.response?.data?.error
      const msg = typeof err === 'string' ? err : (err?.message || 'Error al iniciar sesión')
      toast.error(msg)
      return { success: false, error: msg }
    }
  }

  const register = async (userData) => {
    try {
      const response = await authApi.register(userData)
      const { user, token } = response.data
      localStorage.setItem('token', token)
      setUser(user)
      setIsAuthenticated(true)
      toast.success('¡Cuenta creada exitosamente!')
      navigate('/discover')
      return { success: true }
    } catch (error) {
      const err = error?.response?.data?.error
      const msg = typeof err === 'string' ? err : (err?.message || 'Error al registrar')
      toast.error(msg)
      return { success: false, error: msg }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    setIsAuthenticated(false)
    navigate('/login')
    toast.success('Sesión cerrada')
  }

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser: setUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
