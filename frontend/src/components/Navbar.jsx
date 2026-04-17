/**
 * Navigation Bar Component
 * 
 * Displays user navigation and authentication status.
 * Responsive design for mobile and desktop.
 */

import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { translations } from '../i18n/translations'

export const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth()
  const { language, toggleLanguage } = useLanguage()
  const t = translations[language]
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center min-h-16 py-2 gap-3">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-red-600 hover:text-red-700 transition shrink-0">
            <img src="/pokeball.svg" alt="Pokeball logo" className="w-8 h-8" />
            <span className="hidden sm:inline">PokéDex</span>
          </Link>

          {/* Navigation Menu */}
          <div className="flex items-center gap-2 sm:gap-4 md:gap-6 min-w-0">
            <button
              onClick={toggleLanguage}
              className="px-2 sm:px-3 py-1 border border-gray-300 rounded-lg text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-100 transition shrink-0"
              title="Switch language"
            >
              {t.navbar.languageToggle}
            </button>

            {isAuthenticated() ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="text-gray-700 hover:text-red-600 font-medium transition text-sm sm:text-base"
                >
                  {t.navbar.dashboard}
                </Link>
                <Link 
                  to="/favorites" 
                  className="text-gray-700 hover:text-red-600 font-medium transition text-sm sm:text-base"
                >
                  {t.navbar.favorites}
                </Link>
                
                {/* User Section */}
                <div className="flex items-center gap-2 sm:gap-3 pl-3 sm:pl-6 border-l border-gray-200 min-w-0">
                  <span className="hidden lg:inline text-sm text-gray-600 whitespace-nowrap">
                    {t.navbar.welcome},{' '}
                    <strong className="inline-block max-w-28 truncate align-bottom">{user?.username}</strong>
                  </span>
                  <button 
                    onClick={handleLogout} 
                    className="px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium text-sm whitespace-nowrap shrink-0"
                  >
                    {t.navbar.logout}
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="text-gray-700 hover:text-red-600 font-medium transition"
                >
                  {t.navbar.login}
                </Link>
                <Link 
                  to="/register" 
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                >
                  {t.navbar.register}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
