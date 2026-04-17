/**
 * AI Bonus panel for image analysis, chat context, and recommendations.
 */

import React, { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { aiService } from '../services/api'
import { useLanguage } from '../context/LanguageContext'
import { translations } from '../i18n/translations'

const GeminiSparkIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 2.5l1.9 5.2 5.6 1.9-5.6 1.9L12 16.7l-1.9-5.2-5.6-1.9 5.6-1.9L12 2.5Z" />
  </svg>
)

const MarkdownMessage = ({ content }) => (
  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    components={{
      p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
      ul: ({ children }) => <ul className="list-disc pl-5 mb-2">{children}</ul>,
      ol: ({ children }) => <ol className="list-decimal pl-5 mb-2">{children}</ol>,
      li: ({ children }) => <li className="mb-1">{children}</li>,
      code: ({ inline, children }) =>
        inline ? (
          <code className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-xs">{children}</code>
        ) : (
          <code className="block p-3 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-x-auto text-xs">{children}</code>
        ),
      pre: ({ children }) => <pre className="mb-2">{children}</pre>,
      a: ({ href, children }) => (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-blue-600 dark:text-blue-400"
        >
          {children}
        </a>
      ),
      blockquote: ({ children }) => (
        <blockquote className="border-l-4 border-slate-300 dark:border-slate-600 pl-3 italic mb-2">
          {children}
        </blockquote>
      ),
      strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
      em: ({ children }) => <em className="italic">{children}</em>,
      h1: ({ children }) => <h3 className="text-base font-bold mb-2">{children}</h3>,
      h2: ({ children }) => <h4 className="text-sm font-bold mb-2">{children}</h4>,
      h3: ({ children }) => <h5 className="text-sm font-semibold mb-2">{children}</h5>,
    }}
  >
    {content || ''}
  </ReactMarkdown>
)

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

  const recommendUi = isSpanish
    ? {
        title: '3) Recomendaciones inteligentes',
        action: 'Generar recomendaciones',
        loading: 'Generando...',
        failed: 'No se pudieron generar recomendaciones.',
        summary: 'Resumen',
        because: 'Por que te lo recomiendo',
      }
    : {
        title: '3) Smart recommendations',
        action: 'Generate recommendations',
        loading: 'Generating...',
        failed: 'Failed to generate recommendations.',
        summary: 'Summary',
        because: 'Why I recommend it',
      }

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
      setChatError(error.response?.data?.detail || t.aiSections.chatFailed)
    } finally {
      setChatLoading(false)
    }
  }

  const handleRecommendations = async () => {
    try {
      setRecommendationsLoading(true)
      setRecommendationsError('')
      const result = await aiService.getRecommendations(language)
      setRecommendations(result)
    } catch (error) {
      setRecommendationsError(error.response?.data?.detail || recommendUi.failed)
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
                    {isUser ? (
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{item.content}</p>
                    ) : (
                      <div className="text-sm leading-relaxed">
                        <MarkdownMessage content={item.content} />
                      </div>
                    )}
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

          <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-cyan-200 dark:border-cyan-800 bg-cyan-50 dark:bg-cyan-900/20 px-3 py-1 text-xs font-medium text-cyan-700 dark:text-cyan-300">
            <GeminiSparkIcon />
            <span>{t.aiSections.poweredBy}</span>
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
          <h4 className="font-semibold text-gray-900 dark:text-slate-100 mb-3">{t.aiSections.contextChatTitle}</h4>

          <div className="h-40 overflow-auto bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-md p-2 mb-3">
            {chatHistory.length === 0 ? (
              <p className="text-xs text-gray-500 dark:text-slate-400">{t.aiSections.contextChatEmpty}</p>
            ) : (
              chatHistory.map((item, index) => (
                <div key={`${item.role}-${index}`} className="text-sm mb-2 text-gray-800 dark:text-slate-100">
                  <strong>{item.role === 'user' ? (isSpanish ? 'Tu' : 'You') : 'PokeAssistant'}:</strong>{' '}
                  {item.role === 'user' ? (
                    <span>{item.content}</span>
                  ) : (
                    <div className="mt-1 leading-relaxed">
                      <MarkdownMessage content={item.content} />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={chatMessage}
              onChange={(event) => setChatMessage(event.target.value)}
              placeholder={t.aiSections.contextChatPlaceholder}
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
        <h4 className="font-semibold text-gray-900 dark:text-slate-100 mb-3">{recommendUi.title}</h4>
        <button
          type="button"
          onClick={handleRecommendations}
          disabled={recommendationsLoading}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-60"
        >
          {recommendationsLoading ? recommendUi.loading : recommendUi.action}
        </button>

        {recommendationsError && <p className="mt-3 text-sm text-red-700">{recommendationsError}</p>}

        {recommendations && (
          <div className="mt-4 text-sm text-gray-700 dark:text-slate-200">
            <p className="mb-4"><strong>{recommendUi.summary}:</strong> {recommendations.summary}</p>

            <div className="grid sm:grid-cols-2 gap-3">
              {(recommendations.suggestions || []).map((item, index) => (
                <article
                  key={`${item.name || 'pokemon'}-${index}`}
                  className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3"
                >
                  <h5 className="text-base font-bold text-gray-900 dark:text-slate-100 mb-1 capitalize">
                    {item.name || 'Pokemon'}
                  </h5>
                  <p className="text-xs uppercase tracking-wide text-emerald-600 font-semibold mb-1">
                    {recommendUi.because}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-slate-300">
                    {item.reason || ''}
                  </p>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
      )}

      <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-cyan-200 dark:border-cyan-800 bg-cyan-50 dark:bg-cyan-900/20 px-3 py-1 text-xs font-medium text-cyan-700 dark:text-cyan-300">
        <GeminiSparkIcon />
        <span>{t.aiSections.poweredBy}</span>
      </div>
    </section>
  )
}
