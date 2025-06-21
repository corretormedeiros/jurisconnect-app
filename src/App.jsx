import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'

// Public pages
import LoginPage from './pages/auth/LoginPage'
import RegisterClientPage from './pages/auth/RegisterClientPage'
import RegisterCorrespondentPage from './pages/auth/RegisterCorrespondentPage'

// Dashboard pages
import DashboardLayout from './components/layout/DashboardLayout'
import Dashboard from './pages/dashboard/Dashboard'
import ClientsPage from './pages/admin/ClientsPage'
import CorrespondentsPage from './pages/admin/CorrespondentsPage'
import DemandsPage from './pages/demands/DemandsPage'
import FinancialPage from './pages/admin/FinancialPage'
import ReportsPage from './pages/admin/ReportsPage'
import ApprovalsPage from './pages/admin/ApprovalsPage'
import ProfilePage from './pages/profile/ProfilePage'

// Error pages
import NotFoundPage from './pages/error/NotFoundPage'
import AccessDeniedPage from './pages/error/AccessDeniedPage'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register/client" element={<RegisterClientPage />} />
            <Route path="/register/correspondent" element={<RegisterCorrespondentPage />} />
            
            {/* Protected routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/demands" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <DemandsPage />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/profile" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ProfilePage />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            {/* Admin only routes */}
            <Route path="/admin/clients" element={
              <AdminRoute>
                <DashboardLayout>
                  <ClientsPage />
                </DashboardLayout>
              </AdminRoute>
            } />
            
            <Route path="/admin/correspondents" element={
              <AdminRoute>
                <DashboardLayout>
                  <CorrespondentsPage />
                </DashboardLayout>
              </AdminRoute>
            } />
            
            <Route path="/admin/approvals" element={
              <AdminRoute>
                <DashboardLayout>
                  <ApprovalsPage />
                </DashboardLayout>
              </AdminRoute>
            } />
            
            <Route path="/admin/financial" element={
              <AdminRoute>
                <DashboardLayout>
                  <FinancialPage />
                </DashboardLayout>
              </AdminRoute>
            } />
            
            <Route path="/admin/reports" element={
              <AdminRoute>
                <DashboardLayout>
                  <ReportsPage />
                </DashboardLayout>
              </AdminRoute>
            } />
            
            {/* Error routes */}
            <Route path="/access-denied" element={<AccessDeniedPage />} />
            <Route path="/404" element={<NotFoundPage />} />
            
            {/* Redirects */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
          
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#4ade80',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App