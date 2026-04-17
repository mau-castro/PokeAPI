/**
 * Contexto de autenticacion.
 *
 * Provee manejo global del estado de autenticacion usando React Context API.
 * Gestiona autenticacion, almacenamiento de token y estado compartido.
 */

import React, { createContext, useState, useContext, useEffect } from 'react'
import { authService } from '../services/api'

// Crear contexto
const AuthContext = createContext(null)

/**
 * Componente AuthProvider.
 * Envuelve la aplicacion y provee el contexto de autenticacion.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  /**
   * Inicializa el estado de autenticacion desde localStorage.
   */
  useEffect(() => {
    const storedToken = localStorage.getItem('access_token')
    const storedUser = localStorage.getItem('user')

    if (storedToken) {
      setToken(storedToken)
      if (storedUser) {
        setUser(JSON.parse(storedUser))
      }
    }
    setLoading(false)
  }, [])

  /**
   * Registra un nuevo usuario.
   */
  const register = async (username, email, password) => {
    try {
      setError(null)
      const userData = await authService.register(username, email, password)
      return userData
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Registration failed'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  /**
   * Inicia sesion de usuario.
   */
  const login = async (email, password) => {
    try {
      setError(null)
      const { access_token } = await authService.login(email, password)

      // Guardar token primero para que el interceptor lo envie en /auth/me
      localStorage.setItem('access_token', access_token)
      setToken(access_token)

      // Obtener datos del usuario
      const userData = await authService.getCurrentUser()

      // Guardar usuario
      localStorage.setItem('user', JSON.stringify(userData))
      setUser(userData)

      return { access_token, user: userData }
    } catch (err) {
      localStorage.removeItem('access_token')
      setToken(null)
      const errorMessage = err.response?.data?.detail || 'Login failed'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  /**
   * Cierra sesion del usuario.
   */
  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
    setError(null)
  }

  /**
   * Verifica si el usuario esta autenticado.
   */
  const isAuthenticated = () => !!token && !!user

  const value = {
    user,
    token,
    loading,
    error,
    register,
    login,
    logout,
    isAuthenticated,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * Hook personalizado para usar el contexto de autenticacion.
 */
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
