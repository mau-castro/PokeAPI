/**
 * PokeAnalysis page.
 */

import React from 'react'
import { AIBonusPanel } from '../components/AIBonusPanel'
import { useLanguage } from '../context/LanguageContext'
import { translations } from '../i18n/translations'

export const PokeAnalysisPage = () => {
  const { language } = useLanguage()
  const t = translations[language]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-2">🖼️ {t.aiSections.pokeAnalysisTitle}</h1>
          <p className="text-gray-600 dark:text-slate-300">{t.aiSections.pokeAnalysisSubtitle}</p>
        </div>

        <AIBonusPanel section="analysis" />
      </div>
    </div>
  )
}
