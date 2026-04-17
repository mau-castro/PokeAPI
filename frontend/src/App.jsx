/**
 * Main App Component
 * 
 * Handles routing and application structure.
 */

import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { LanguageProvider, useLanguage } from './context/LanguageContext'
import { ThemeProvider } from './context/ThemeContext'
import { useTheme } from './context/ThemeContext'
import { Navbar } from './components/Navbar'
import { ProtectedRoute } from './components/ProtectedRoute'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { DashboardPage } from './pages/DashboardPage'
import { FavoritesPage } from './pages/FavoritesPage'
import { PokeChatPage } from './pages/PokeChatPage'
import { PokeAnalysisPage } from './pages/PokeAnalysisPage'
import { PokeRecommendPage } from './pages/PokeRecommendPage'
import { translations } from './i18n/translations'
import './index.css'

const AppLayout = () => {
  const { language } = useLanguage()
  const { isDark } = useTheme()
  const t = translations[language]

  return (
    <div className={`flex flex-col min-h-screen ${isDark ? 'dark' : ''}`}>
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/favorites"
            element={
              <ProtectedRoute>
                <FavoritesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pokechat"
            element={
              <ProtectedRoute>
                <PokeChatPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pokeanalysis"
            element={
              <ProtectedRoute>
                <PokeAnalysisPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pokerecommend"
            element={
              <ProtectedRoute>
                <PokeRecommendPage />
              </ProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="mb-2 inline-flex items-center gap-2">
            <img src="/pokeball.svg" alt="Pokeball logo" className="w-5 h-5" />
            <span>PokéDex Manager v1.0.0</span>
          </p>
          <p className="text-sm">
            {t.footer.builtWith}{' '}
            <a
              href="https://pokeapi.co"
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-500 hover:text-red-400 transition"
            >
              PokéAPI
            </a>
          </p>

          <div className="mt-5 max-w-3xl mx-auto rounded-xl border border-gray-700 bg-gray-800/80 shadow-lg shadow-black/20 overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-red-500 via-orange-400 to-yellow-400" />
            <div className="px-4 py-3 sm:px-6 sm:py-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-gray-500 mb-1">
                Sello del proyecto
              </p>
              <p className="text-xs sm:text-sm text-gray-200 leading-relaxed">
                {t.footer.signature}
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <LanguageProvider>
            <AppLayout />
          </LanguageProvider>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
