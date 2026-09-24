import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { donorLoginService, donorRegisterService, loginService, logoutService, updateUserService } from '../api/apiService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('dh_user')
    return saved ? JSON.parse(saved) : null
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) localStorage.setItem('dh_user', JSON.stringify(user))
    else localStorage.removeItem('dh_user')
  }, [user])

  async function login(email, password) {
    setError('')
    setLoading(true)
    try {
      const { data } = await loginService(email, password)
      localStorage.setItem('dh_token', data.token)
      setUser(data.user)
      return true
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.')
      return false
    } finally {
      setLoading(false)
    }
  }

  async function registerDonor(data) {
    setError('')
    setLoading(true)
    try {
      const { data: response } = await donorRegisterService(data)
      if (response.token) localStorage.setItem('dh_token', response.token)
      return true
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create your account.')
      return false
    } finally {
      setLoading(false)
    }
  }

  async function logout() {
    try {
      await logoutService()
    } catch (err) {
      // even if the server call fails, still clear local session
    }
    localStorage.removeItem('dh_token')
    setUser(null)
  }

  async function updateProfile(name) {
    const userId = user?._id || user?.id
    if (!userId) throw new Error('Your user ID is missing. Please sign in again.')

    const { data: response } = await updateUserService(userId, { name })
    setUser(response.data)
    return response
  }

  async function loginDonor(email, password) {
    setError('')
    setLoading(true)
    try {
      const { data } = await donorLoginService(email, password)
      localStorage.setItem('dh_token', data.token)
      setUser(data.user || data.donor)
      return true
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid donor email or password.')
      return false
    } finally {
      setLoading(false)
    }
  }

  const contextValue = useMemo(
    () => ({ user, login, loginDonor, registerDonor, logout, updateProfile, error, loading }),
    [user, error, loading],
  )

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}