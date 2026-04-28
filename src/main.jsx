import './index.css'
import App from './App.jsx'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'


import { AuthProvider } from './context/AuthContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'

import ProtectedRoute from './components/ProtectedRoute.jsx'

import ProfilePage from './pages/ProfilePage.jsx';
import ReportPage from './pages/ReportPage.jsx'
import VerifyEmail from './pages/VerifyEmail.jsx'
import SettingsPage from './pages/SettingsPage.jsx'
import AnalyticsPage from './pages/AnalyticsPage.jsx'
import OAuthSuccess from './pages/OAuthSuccess.jsx'
import LoginRedirect from './pages/LoginRedirect.jsx'
import SignupRedirect from './pages/SignupRedirect.jsx'



createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            {/* Public Route - সবাই দেখতে পারবে */}
            <Route path="/" element={<App />} />
            <Route path="/login" element={<LoginRedirect />} />
            <Route path="/signup" element={<SignupRedirect />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/oauth-success" element={<OAuthSuccess />} />

            {/* Protected Routes - শুধু লগইন ইউজার দেখতে পারবে */}
            <Route path="/analytics" element={
              <ProtectedRoute>
                <AnalyticsPage />
              </ProtectedRoute>
            } />

            <Route path="/reports" element={
              <ProtectedRoute>
                <ReportPage />
              </ProtectedRoute>
            } />

            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />

            <Route path="/settings" element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            } />


          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
