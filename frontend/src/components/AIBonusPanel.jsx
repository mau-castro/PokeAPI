/**
 * AI Bonus panel for image analysis, chat context, and recommendations.
 */

import React, { useState } from 'react'
import { aiService } from '../services/api'
import { useLanguage } from '../context/LanguageContext'
import { translations } from '../i18n/translations'

export const AIBonusPanel = ({ section = 'all' }) => {
  const { language } = useLanguage()
  const t = translations[language]
  const isSpanish = language === 'es'

  const showAnalysis = section === 'all' || section === 'analysis'
  const showChat = section === 'all' || section === 'chat'
  const showRecommend = section === 'all' || section === 'recommend'
  const isChatOnly = section === 'chat'

  const [imageFile, setImageFile] = useState(null)
  const [imageLoading, setImageLoading] = useState(false)
  const [imageResult, setImageResult] = useState(null)
  const [imageError, setImageError] = useState('')

  const [chatMessage, setChatMessage] = useState('')
  const [chatSessionId, setChatSessionId] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [chatHistory, setChatHistory] = useState([])
  const [chatError, setChatError] = useState('')

  const [recommendations, setRecommendations] = useState(null)
  const [recommendationsLoading, setRecommendationsLoading] = useState(false)
  const [recommendationsError, setRecommendationsError] = useState('')

  const handleAnalyzeImage = async () => {
    if (!imageFile) {
      setImageError('Selecciona una imagen primero.')
      return
    }

    try {
      setImageLoading(true)
      setImageError('')
      const result = await aiService.analyzeImage(imageFile)
      setImageResult(result)
    } catch (error) {
      setImageError(error.response?.data?.detail || 'No se pudo analizar la imagen.')
    } finally {
      setImageLoading(false)
    }
  }

  const handleSendChat = async () => {
    const trimmed = chatMessage.trim()
    if (!trimmed) {
      return
    }

    try {
      setChatLoading(true)
      setChatError('')
      const result = await aiService.chat(trimmed, chatSessionId || null)
      setChatSessionId(result.session_id)

      setChatHistory((prev) => [
        ...prev,
        { role: 'user', content: trimmed },
        { role: 'assistant', content: result.reply },
      ])
      setChatMessage('')
    } catch (error) {
      setChatError(error.response?.data?.detail || 'No se pudo obtener respuesta del chat.')
    } finally {
      setChatLoading(false)
    }
  }

  const handleRecommendations = async () => {
    try {
      setRecommendationsLoading(true)
      setRecommendationsError('')
      const result = await aiService.getRecommendations()
      setRecommendations(result)
    } catch (error) {
      setRecommendationsError(error.response?.data?.detail || 'No se pudieron generar recomendaciones.')
    } finally {
      setRecommendationsLoading(false)
    }
  }

  const handleChatKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      if (!chatLoading) {
        handleSendChat()
      }
    }
  }

  if (isChatOnly) {
    const chatUi = t.aiSections.chatUi

    return (
      <section className="mt-6 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-slate-700 bg-gradient-to-r from-blue-50 via-white to-cyan-50 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">{chatUi.badge}</p>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-slate-100">{chatUi.title}</h2>
          <p className="text-sm text-gray-600 dark:text-slate-300">{chatUi.subtitle}</p>
        </div>

        <div className="h-[60vh] sm:h-[65vh] overflow-y-auto bg-gray-50 dark:bg-slate-950 px-3 sm:px-6 py-4 space-y-4">
          {chatHistory.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-sm text-gray-500 dark:text-slate-300">{chatUi.empty}</p>
            </div>
          ) : (
            chatHistory.map((item, index) => {
              const isUser = item.role === 'user'
              return (
                <div
                  key={`${item.role}-${index}`}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[88%] sm:max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${
                      isUser
                        ? 'bg-blue-600 text-white'
                        : 'bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-100 border border-gray-200 dark:border-slate-700'
                    }`}
                  >
                    <p className={`text-xs mb-1 font-semibold ${isUser ? 'text-blue-100' : 'text-gray-500 dark:text-slate-400'}`}>
                      {isUser ? chatUi.you : chatUi.assistant}
                    </p>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{item.content}</p>
                  </div>
                </div>
              )
            })
          )}
        </div>

        <div className="border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 sm:px-6 py-3 sm:py-4">
          {chatError && <p className="mb-3 text-sm text-red-700">{chatError}</p>}

          <div className="flex items-end gap-2 sm:gap-3">
            <textarea
              value={chatMessage}
              onChange={(event) => setChatMessage(event.target.value)}
              onKeyDown={handleChatKeyDown}
              placeholder={chatUi.placeholder}
              rows={2}
              className="flex-1 resize-none px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={handleSendChat}
              disabled={chatLoading}
              className="px-4 py-2.5 sm:px-5 sm:py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-60 font-medium"
            >
              {chatLoading ? chatUi.sending : chatUi.send}
            </button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="mt-10 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      {(showAnalysis || showChat) && (
      <div className="grid md:grid-cols-2 gap-6">
        {showAnalysis && (
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">1) Analizar imagen Pokemon</h4>
          <input
            type="file"
            accept="image/*"
            onChange={(event) => setImageFile(event.target.files?.[0] || null)}
            className="mb-3 block w-full text-sm text-gray-700"
          />
          <button
            type="button"
            onClick={handleAnalyzeImage}
            disabled={imageLoading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-60"
          >
            {imageLoading ? 'Analizando...' : 'Analizar imagen'}
          </button>

          {imageError && <p className="mt-3 text-sm text-red-700">{imageError}</p>}
          {imageResult && (
            <div className="mt-3 text-sm text-gray-700 space-y-1">
              <p>
                <strong>Pokemon detectado:</strong> {imageResult.detected_pokemon || 'No identificado'}
              </p>
              <p>
                <strong>Caracteristicas:</strong>{' '}
                {Array.isArray(imageResult.characteristics) && imageResult.characteristics.length > 0
                  ? imageResult.characteristics.join(', ')
                  : 'Sin datos'}
              </p>
              <p>
                <strong>Nota:</strong> {imageResult.confidence_note || 'Sin nota'}
              </p>
            </div>
          )}
        </div>
        )}

        {showChat && (
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">2) Chat con contexto</h4>

          <div className="h-40 overflow-auto bg-gray-50 border border-gray-200 rounded-md p-2 mb-3">
            {chatHistory.length === 0 ? (
              <p className="text-xs text-gray-500">Sin mensajes todavia.</p>
            ) : (
              chatHistory.map((item, index) => (
                <p key={`${item.role}-${index}`} className="text-sm mb-2">
                  <strong>{item.role === 'user' ? (isSpanish ? 'Tu' : 'You') : 'PokeAssistant'}:</strong> {item.content}
                </p>
              ))
            )}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={chatMessage}
              onChange={(event) => setChatMessage(event.target.value)}
              placeholder="Pregunta sobre tu coleccion..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
            />
            <button
              type="button"
              onClick={handleSendChat}
              disabled={chatLoading}
              className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-60"
            >
              {chatLoading ? '...' : 'Enviar'}
            </button>
          </div>

          {chatError && <p className="mt-3 text-sm text-red-700">{chatError}</p>}
        </div>
        )}
      </div>
      )}

      {showRecommend && (
      <div className={`${showAnalysis || showChat ? 'mt-6' : ''} border border-gray-200 rounded-lg p-4`}>
        <h4 className="font-semibold text-gray-900 mb-3">3) Recomendaciones inteligentes</h4>
        <button
          type="button"
          onClick={handleRecommendations}
          disabled={recommendationsLoading}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-60"
        >
          {recommendationsLoading ? 'Generando...' : 'Generar recomendaciones'}
        </button>

        {recommendationsError && <p className="mt-3 text-sm text-red-700">{recommendationsError}</p>}

        {recommendations && (
          <div className="mt-4 text-sm text-gray-700">
            <p className="mb-2"><strong>Resumen:</strong> {recommendations.summary}</p>
            <ul className="list-disc pl-5">
              {(recommendations.suggestions || []).map((item, index) => (
                <li key={`${item}-${index}`}>{item}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      )}
    </section>
  )
}
