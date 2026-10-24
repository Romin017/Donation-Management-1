import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { DashboardLayout } from './components/layout/DashboardLayout'
import Login from './pages/Login'
import Register from './pages/Register'
import LandingPage from './pages/LandingPage'
import Donate from './pages/Donate'
import DonorDashboard from './pages/DonorDashboard'
import SetPassword from './pages/SetPassword'
import DonorProfile from './pages/DonorProfile'
import Donors from './pages/Donors'
import Donations from './pages/Donations'
import Campaigns from './pages/Campaigns'
import Expenses from './pages/Expenses'
import Users from './pages/Users'
import UserProfile from './pages/UserProfile'

function RequireBackOffice({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role === 'Donor') return <Navigate to="/donor-dashboard" replace />
  return children
}

function RequireDonor({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'Donor') return <Navigate to="/donors" replace />
  return children
}

export default function App() {
  const { user } = useAuth()

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/login"
        element={user ? <Navigate to={user.role === 'Donor' ? '/donor-dashboard' : '/donors'} replace /> : <Login />}
      />
      <Route
        path="/register"
        element={user ? <Navigate to={user.role === 'Donor' ? '/donor-dashboard' : '/donors'} replace /> : <Register />}
      />
      <Route path="/set-password/:token" element={<SetPassword />} />
      <Route
        path="/donor-dashboard"
        element={
          <RequireDonor>
            <DonorDashboard />
          </RequireDonor>
        }
      />
      <Route
        path="/donate"
        element={
          <RequireDonor>
            <Donate />
          </RequireDonor>
        }
      />
      <Route
        path="/donor-profile"
        element={
          <RequireDonor>
            <DonorProfile />
          </RequireDonor>
        }
      />

      <Route
        element={
          <RequireBackOffice>
            <DashboardLayout />
          </RequireBackOffice>
        }
      >
        <Route path="/" element={<Navigate to="/donors" replace />} />
        <Route path="/donors" element={<Donors />} />
        <Route path="/campaigns" element={<Campaigns />} />
        <Route path="/donations" element={<Donations />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/users" element={<Users />} />
        <Route
          path="/user-profile"
          element={
            <RequireBackOffice>
              <UserProfile />
            </RequireBackOffice>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/donors" replace />} />
    </Routes>
  )
}