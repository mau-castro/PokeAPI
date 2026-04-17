/**
 * AI Integration page.
 *
 * Dedicated protected section for IA features.
 */

import React from 'react'
import { AIBonusPanel } from '../components/AIBonusPanel'
import { useLanguage } from '../context/LanguageContext'
import { translations } from '../i18n/translations'

export const AIIntegrationPage = () => {
  const { language } = useLanguage()
  const t = translations[language]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🤖 {t.aiIntegration.title}</h1>
          <p className="text-gray-600">{t.aiIntegration.subtitle}</p>
        </div>

        <AIBonusPanel />
      </div>
    </div>
  )
}
