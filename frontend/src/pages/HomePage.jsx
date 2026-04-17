/**
 * Home Page Component
 * 
 * Landing page for unauthenticated users.
 */

import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { translations } from '../i18n/translations'

export const HomePage = () => {
  const { isAuthenticated } = useAuth()
  const { language } = useLanguage()
  const t = translations[language]

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="mb-6 flex justify-center">
            <img src="/pokeball.svg" alt="Pokeball logo" className="w-20 h-20 md:w-24 md:h-24" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-slate-100 mb-6">
            {t.home.title} <span className="text-red-600">PokéDex Manager</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto">
            {t.home.subtitle}
          </p>

          {!isAuthenticated() && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/login"
                className="px-8 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition"
              >
                {t.home.signIn}
              </Link>
              <Link
                to="/register"
                className="px-8 py-3 bg-white dark:bg-slate-900 text-red-600 font-semibold border-2 border-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-slate-800 transition"
              >
                {t.home.createAccount}
              </Link>
            </div>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-lg shadow-lg p-6">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-2">{t.home.featureSearchTitle}</h3>
            <p className="text-gray-600 dark:text-slate-300">
              {t.home.featureSearchText}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-lg shadow-lg p-6">
            <div className="text-4xl mb-4">❤️</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-2">{t.home.featureFavTitle}</h3>
            <p className="text-gray-600 dark:text-slate-300">
              {t.home.featureFavText}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-lg shadow-lg p-6">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-2">{t.home.featureStatsTitle}</h3>
            <p className="text-gray-600 dark:text-slate-300">
              {t.home.featureStatsText}
            </p>
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-lg shadow-lg p-8 md:p-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-6">{t.home.howItWorks}</h2>
          <div className="space-y-4 text-gray-600 dark:text-slate-300">
            <p className="flex items-start gap-3">
              <span className="text-2xl text-red-600 font-bold">1</span>
              <span>{t.home.step1}</span>
            </p>
            <p className="flex items-start gap-3">
              <span className="text-2xl text-red-600 font-bold">2</span>
              <span>{t.home.step2}</span>
            </p>
            <p className="flex items-start gap-3">
              <span className="text-2xl text-red-600 font-bold">3</span>
              <span>{t.home.step3}</span>
            </p>
            <p className="flex items-start gap-3">
              <span className="text-2xl text-red-600 font-bold">4</span>
              <span>{t.home.step4}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
