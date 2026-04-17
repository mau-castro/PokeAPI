/**
 * Componente de pagina de registro.
 *
 * Maneja el registro de nuevos usuarios.
 */

import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { translations } from '../i18n/translations'

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register, login } = useAuth()
  const { language } = useLanguage()
  const t = translations[language]
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validacion
    if (formData.password !== formData.confirmPassword) {
      setError(t.register.errorPasswordMatch)
      return
    }

    if (formData.password.length < 8) {
      setError(t.register.errorPasswordLength)
      return
    }

    setLoading(true)

    try {
      await register(formData.username, formData.email, formData.password)
      // Inicio de sesion automatico despues del registro exitoso
      await login(formData.email, formData.password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || t.register.errorFallback)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-blue-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Tarjeta */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Encabezado */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-8">
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <img src="/pokeball.svg" alt="Pokeball logo" className="w-8 h-8" />
              <span>{t.register.title}</span>
            </h1>
            <p className="text-red-100">{t.register.subtitle}</p>
          </div>

          {/* Formulario */}
          <div className="px-6 py-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Campo de username */}
              <div>
                <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                  {t.register.username}
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  minLength="3"
                  placeholder={t.register.usernamePlaceholder}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                />
              </div>

              {/* Campo de email */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  {t.register.email}
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="your@email.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                />
              </div>

              {/* Campo de password */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  {t.register.password}
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength="8"
                  placeholder="••••••••"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                />
                <p className="mt-1 text-xs text-gray-500">{t.register.passwordHint}</p>
              </div>

              {/* Campo de confirmacion de password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                  {t.register.confirmPassword}
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength="8"
                  placeholder="••••••••"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition mt-6"
              >
                {loading ? t.register.loading : t.register.submit}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                {t.register.alreadyHave}{' '}
                <Link to="/login" className="text-red-600 font-semibold hover:text-red-700 transition">
                  {t.register.signInHere}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
