/**
 * Contexto de idioma (ES/EN).
 *
 * Gestiona el idioma global y su persistencia en localStorage.
 */

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

const LanguageContext = createContext(null)

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('es')

  useEffect(() => {
    const storedLanguage = localStorage.getItem('language')
    if (storedLanguage === 'es' || storedLanguage === 'en') {
      setLanguage(storedLanguage)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('language', language)
    document.documentElement.lang = language
  }, [language])

  const toggleLanguage = () => {
    setLanguage((current) => (current === 'es' ? 'en' : 'es'))
  }

  const value = useMemo(
    () => ({ language, setLanguage, toggleLanguage }),
    [language]
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}
