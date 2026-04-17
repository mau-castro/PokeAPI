/**
 * AI Bonus panel for image analysis, chat context, and recommendations.
 */

import React, { useEffect, useState } from 'react'
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
  const [imagePreviewUrl, setImagePreviewUrl] = useState('')
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

  useEffect(() => {
    if (!imageFile) {
      setImagePreviewUrl('')
      return undefined
    }

    const previewUrl = URL.createObjectURL(imageFile)
    setImagePreviewUrl(previewUrl)

    return () => {
      URL.revokeObjectURL(previewUrl)
    }
  }, [imageFile])

  const analysisUi = isSpanish
    ? {
        title: '1) Analizar imagen Pokemon',
        dropTitle: 'Carga una imagen para analizar',
        dropHint: 'PNG, JPG o WEBP',
        pickImage: 'Seleccionar imagen',
        changeImage: 'Cambiar imagen',
        removeImage: 'Quitar',
        analyzing: 'Analizando...',
        analyze: 'Analizar imagen',
        noImage: 'Selecciona una imagen primero.',
        failed: 'No se pudo analizar la imagen.',
        detected: 'Pokemon detectado',
        characteristics: 'Caracteristicas',
        note: 'Nota',
        noData: 'Sin datos',
      }
    : {
        title: '1) Analyze Pokemon image',
        dropTitle: 'Upload an image to analyze',
        dropHint: 'PNG, JPG or WEBP',
        pickImage: 'Select image',
        changeImage: 'Change image',
        removeImage: 'Remove',
        analyzing: 'Analyzing...',
        analyze: 'Analyze image',
        noImage: 'Select an image first.',
        failed: 'Image analysis failed.',
        detected: 'Detected Pokemon',
        characteristics: 'Characteristics',
        note: 'Note',
        noData: 'No data',
      }

  const handleAnalyzeImage = async () => {
    if (!imageFile) {
      setImageError(analysisUi.noImage)
      return
    }

    try {
      setImageLoading(true)
      setImageError('')
      const result = await aiService.analyzeImage(imageFile, language)
      setImageResult(result)
    } catch (error) {
      setImageError(error.response?.data?.detail || analysisUi.failed)
    } finally {
      setImageLoading(false)
    }
  }

  const handleSelectImage = (event) => {
    const file = event.target.files?.[0] || null
    setImageFile(file)
    setImageResult(null)
    setImageError('')
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
    <section className="mt-10 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
      {(showAnalysis || showChat) && (
      <div className={`grid gap-6 ${showAnalysis && showChat ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
        {showAnalysis && (
        <div className="border border-gray-200 dark:border-slate-700 rounded-xl p-4 sm:p-5">
          <h4 className="font-semibold text-gray-900 dark:text-slate-100 mb-4">{analysisUi.title}</h4>

          <div className="grid lg:grid-cols-2 gap-4">
            <div>
              <label className="block w-full p-4 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-800/60">
                <p className="text-sm font-semibold text-gray-800 dark:text-slate-100">{analysisUi.dropTitle}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400 mb-3">{analysisUi.dropHint}</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleSelectImage}
                  className="block w-full text-sm text-gray-700 dark:text-slate-200"
                />
              </label>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleAnalyzeImage}
                  disabled={imageLoading || !imageFile}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-60"
                >
                  {imageLoading ? analysisUi.analyzing : analysisUi.analyze}
                </button>
                {imageFile && (
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null)
                      setImageResult(null)
                      setImageError('')
                    }}
                    className="px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-200 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600"
                  >
                    {analysisUi.removeImage}
                  </button>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/60 min-h-48 p-3 flex items-center justify-center overflow-hidden">
              {imagePreviewUrl ? (
                <img src={imagePreviewUrl} alt="Pokemon preview" className="max-h-56 w-auto object-contain rounded-lg" />
              ) : (
                <p className="text-sm text-gray-500 dark:text-slate-400 text-center">{analysisUi.pickImage}</p>
              )}
            </div>
          </div>

          {imageError && <p className="mt-4 text-sm text-red-700 dark:text-red-400">{imageError}</p>}

          {imageResult && (
            <div className="mt-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 text-sm text-gray-700 dark:text-slate-200 space-y-2">
              <p>
                <strong>{analysisUi.detected}:</strong> {imageResult.detected_pokemon || analysisUi.noData}
              </p>
              <p>
                <strong>{analysisUi.characteristics}:</strong>{' '}
                {Array.isArray(imageResult.characteristics) && imageResult.characteristics.length > 0
                  ? imageResult.characteristics.join(', ')
                  : analysisUi.noData}
              </p>
              <p>
                <strong>{analysisUi.note}:</strong> {imageResult.confidence_note || analysisUi.noData}
              </p>
            </div>
          )}
        </div>
        )}

        {showChat && (
        <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 dark:text-slate-100 mb-3">2) Chat con contexto</h4>

          <div className="h-40 overflow-auto bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-md p-2 mb-3">
            {chatHistory.length === 0 ? (
              <p className="text-xs text-gray-500 dark:text-slate-400">Sin mensajes todavia.</p>
            ) : (
              chatHistory.map((item, index) => (
                <p key={`${item.role}-${index}`} className="text-sm mb-2 text-gray-800 dark:text-slate-100">
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
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 rounded-md"
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
      <div className={`${showAnalysis || showChat ? 'mt-6' : ''} border border-gray-200 dark:border-slate-700 rounded-lg p-4`}>
        <h4 className="font-semibold text-gray-900 dark:text-slate-100 mb-3">3) Recomendaciones inteligentes</h4>
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
          <div className="mt-4 text-sm text-gray-700 dark:text-slate-200">
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
