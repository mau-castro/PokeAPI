/**
 * Dashboard Page Component
 * 
 * Main dashboard for authenticated users to search and manage Pokémon.
 */

import React from 'react'
import { PokemonSearch } from '../components/PokemonSearch'
import { useLanguage } from '../context/LanguageContext'
import { translations } from '../i18n/translations'

export const DashboardPage = () => {
  const { language } = useLanguage()
  const t = translations[language]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🔍 {t.dashboard.title}</h1>
          <p className="text-gray-600">
            {t.dashboard.subtitle}
          </p>
        </div>

        {/* Search Component */}
        <PokemonSearch />
      </div>
    </div>
  )
}
