import React, { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userData, setUserData] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem('jurisconnect_token')
        const storedUser = localStorage.getItem('jurisconnect_user')

        if (storedToken && storedUser) {
          // Verify token is still valid
          const response = await authAPI.verifyToken(storedToken)
          
          if (response.data.success) {
            setToken(storedToken)
            setUserData(JSON.parse(storedUser))
            setIsAuthenticated(true)
          } else {
            // Token is invalid, clear storage
            localStorage.removeItem('jurisconnect_token')
            localStorage.removeItem('jurisconnect_user')
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        localStorage.removeItem('jurisconnect_token')
        localStorage.removeItem('jurisconnect_user')
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = (authToken, user) => {
    setToken(authToken)
    setUserData(user)
    setIsAuthenticated(true)
    
    localStorage.setItem('jurisconnect_token', authToken)
    localStorage.setItem('jurisconnect_user', JSON.stringify(user))
  }

  const logout = () => {
    setToken(null)
    setUserData(null)
    setIsAuthenticated(false)
    
    localStorage.removeItem('jurisconnect_token')
    localStorage.removeItem('jurisconnect_user')
  }

  const isAdmin = () => {
    return userData?.profile === 'admin'
  }

  const isClient = () => {
    return userData?.profile === 'cliente'
  }

  const isCorrespondent = () => {
    return userData?.profile === 'correspondente'
  }

  const value = {
    isAuthenticated,
    userData,
    token,
    loading,
    login,
    logout,
    isAdmin,
    isClient,
    isCorrespondent
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}