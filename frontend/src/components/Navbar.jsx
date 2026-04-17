/**
 * Navigation Bar Component
 * 
 * Displays user navigation and authentication status.
 * Responsive design for mobile and desktop.
 */

import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { useTheme } from '../context/ThemeContext'
import { translations } from '../i18n/translations'

const SunIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2.2M12 19.8V22M4.93 4.93l1.56 1.56M17.51 17.51l1.56 1.56M2 12h2.2M19.8 12H22M4.93 19.07l1.56-1.56M17.51 6.49l1.56-1.56" />
  </svg>
)

const MoonIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 12.79A9 9 0 1 1 11.21 3c.2 0 .4 0 .59.02A7 7 0 0 0 21 12.79Z" />
  </svg>
)

export const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth()
  const isLoggedIn = isAuthenticated()
  const { language, toggleLanguage } = useLanguage()
  const { isDark, toggleTheme } = useTheme()
  const t = translations[language]
  const navigate = useNavigate()
  const location = useLocation()
  const aiMobileLabel = language === 'es' ? 'IA' : 'AI'
  const [isMobileProfileOpen, setIsMobileProfileOpen] = useState(false)

  const aiRoutePaths = ['/pokechat', '/pokeanalysis', '/pokerecommend']
  const selectedAiRoute = aiRoutePaths.includes(location.pathname) ? location.pathname : '__ai_menu__'

  const handleLogout = () => {
    setIsMobileProfileOpen(false)
    logout()
    navigate('/login')
  }

  const handleMobileLanguageToggle = () => {
    toggleLanguage()
    setIsMobileProfileOpen(false)
  }

  const handleMobileThemeToggle = () => {
    toggleTheme()
    setIsMobileProfileOpen(false)
  }

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-lg dark:bg-slate-900 dark:shadow-slate-950/70">
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
              className={`${isLoggedIn ? 'hidden md:inline-flex' : 'inline-flex'} px-2 sm:px-3 py-1 border border-gray-300 dark:border-slate-600 rounded-lg text-xs sm:text-sm font-semibold text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition shrink-0`}
              title="Switch language"
            >
              {t.navbar.languageToggle}
            </button>

            <button
              onClick={toggleTheme}
              className={`${isLoggedIn ? 'hidden md:inline-flex' : 'inline-flex'} items-center justify-center w-9 h-9 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition shrink-0`}
              title={t.navbar.theme}
              aria-label={t.navbar.theme}
            >
              {isDark ? <SunIcon /> : <MoonIcon />}
            </button>

            {isLoggedIn ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="text-gray-700 dark:text-slate-200 hover:text-red-600 font-medium transition text-sm sm:text-base"
                >
                  {t.navbar.dashboard}
                </Link>
                <Link 
                  to="/favorites" 
                  className="text-gray-700 dark:text-slate-200 hover:text-red-600 font-medium transition text-sm sm:text-base"
                >
                  {t.navbar.favorites}
                </Link>

                <div className="hidden md:flex items-center gap-2">
                  <Link
                    to="/pokechat"
                    className="text-gray-700 dark:text-slate-200 hover:text-red-600 font-medium transition text-sm sm:text-base inline-flex items-center gap-1"
                  >
                    {t.navbar.pokeChat}
                    <span className="text-[9px] px-1.5 py-px leading-none rounded bg-blue-100 text-blue-700 font-semibold">
                      {t.navbar.aiBadge}
                    </span>
                  </Link>
                  <Link
                    to="/pokeanalysis"
                    className="text-gray-700 dark:text-slate-200 hover:text-red-600 font-medium transition text-sm sm:text-base inline-flex items-center gap-1"
                  >
                    {t.navbar.pokeAnalysis}
                    <span className="text-[9px] px-1.5 py-px leading-none rounded bg-blue-100 text-blue-700 font-semibold">
                      {t.navbar.aiBadge}
                    </span>
                  </Link>
                  <Link
                    to="/pokerecommend"
                    className="text-gray-700 dark:text-slate-200 hover:text-red-600 font-medium transition text-sm sm:text-base inline-flex items-center gap-1"
                  >
                    {t.navbar.pokeRecommend}
                    <span className="text-[9px] px-1.5 py-px leading-none rounded bg-blue-100 text-blue-700 font-semibold">
                      {t.navbar.aiBadge}
                    </span>
                  </Link>
                </div>

                <div className="md:hidden">
                  <select
                    value={selectedAiRoute}
                    onChange={(event) => {
                      if (event.target.value && event.target.value !== '__ai_menu__') {
                        navigate(event.target.value)
                      }
                    }}
                    className="px-2 py-1 border border-gray-300 dark:border-slate-600 rounded-lg text-xs text-gray-700 dark:text-slate-200 bg-white dark:bg-slate-900"
                    aria-label={aiMobileLabel}
                  >
                    <option value="__ai_menu__" disabled>{aiMobileLabel}</option>
                    <option value="/pokechat">{t.navbar.pokeChat} ({t.navbar.aiBadge})</option>
                    <option value="/pokeanalysis">{t.navbar.pokeAnalysis} ({t.navbar.aiBadge})</option>
                    <option value="/pokerecommend">{t.navbar.pokeRecommend} ({t.navbar.aiBadge})</option>
                  </select>
                </div>
                
                {/* Desktop User Section */}
                <div className="hidden md:flex items-center gap-2 sm:gap-3 pl-3 sm:pl-6 border-l border-gray-200 dark:border-slate-700 min-w-0">
                  <span className="hidden lg:inline text-sm text-gray-600 dark:text-slate-300 whitespace-nowrap">
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

                {/* Mobile compact preferences/profile menu */}
                <div className="md:hidden relative">
                  <button
                    type="button"
                    onClick={() => setIsMobileProfileOpen((prev) => !prev)}
                    className="w-10 h-10 rounded-full border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-200 bg-white dark:bg-slate-900 font-semibold text-sm"
                    aria-label={t.navbar.preferences}
                  >
                    {(user?.username || 'U').slice(0, 1).toUpperCase()}
                  </button>

                  {isMobileProfileOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl p-2 z-50">
                      <p className="px-2 py-1 text-[11px] uppercase tracking-wide text-gray-500 dark:text-slate-400">
                        {t.navbar.preferences}
                      </p>

                      <button
                        type="button"
                        onClick={handleMobileLanguageToggle}
                        className="w-full text-left px-2 py-2 text-sm rounded-md text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800"
                      >
                        {t.navbar.languageLabel}: {t.navbar.languageToggle}
                      </button>

                      <button
                        type="button"
                        onClick={handleMobileThemeToggle}
                        className="w-full text-left px-2 py-2 text-sm rounded-md text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 inline-flex items-center justify-between"
                      >
                        <span>{t.navbar.theme}</span>
                        <span className="inline-flex items-center gap-1.5">
                          {isDark ? <SunIcon /> : <MoonIcon />}
                          <span>{isDark ? t.navbar.themeLight : t.navbar.themeDark}</span>
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full text-left px-2 py-2 text-sm rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
                      >
                        {t.navbar.logout}
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="text-gray-700 dark:text-slate-200 hover:text-red-600 font-medium transition"
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
