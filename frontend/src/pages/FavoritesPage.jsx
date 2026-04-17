/**
 * Favorites Page Component
 * 
 * Displays user's favorite Pokémon collection.
 */

import React, { useState, useEffect } from 'react'
import { favoriteService, pokemonService } from '../services/api'
import { useLanguage } from '../context/LanguageContext'
import { translations } from '../i18n/translations'

const typeColors = {
  fire: 'bg-pokemon-fire',
  water: 'bg-pokemon-water',
  grass: 'bg-pokemon-grass',
  electric: 'bg-pokemon-electric',
  ice: 'bg-pokemon-ice',
  fighting: 'bg-pokemon-fighting',
  poison: 'bg-pokemon-poison',
  ground: 'bg-pokemon-ground',
  flying: 'bg-pokemon-flying',
  psychic: 'bg-pokemon-psychic',
  bug: 'bg-pokemon-bug',
  rock: 'bg-pokemon-rock',
  ghost: 'bg-pokemon-ghost',
  dragon: 'bg-pokemon-dragon',
  dark: 'bg-pokemon-dark',
  steel: 'bg-pokemon-steel',
  fairy: 'bg-pokemon-fairy',
}

export const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [error, setError] = useState('')
  const [count, setCount] = useState(0)
  const [cardImageErrors, setCardImageErrors] = useState({})
  const [detailImageError, setDetailImageError] = useState(false)
  const [selectedPokemon, setSelectedPokemon] = useState(null)
  const [isClosingDetail, setIsClosingDetail] = useState(false)
  const { language } = useLanguage()
  const t = translations[language]

  useEffect(() => {
    loadFavorites()
  }, [])

  const loadFavorites = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await favoriteService.getFavorites(50, 0)
      const countData = await favoriteService.getFavoritesCount()
      setFavorites(data)
      setCount(countData.count)
    } catch (err) {
      setError(t.favorites.loadError)
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (pokemonId) => {
    try {
      await favoriteService.removeFavorite(pokemonId)
      setFavorites((prev) => prev.filter((f) => f.pokemon_id !== pokemonId))
      setCount((prev) => Math.max(0, prev - 1))
      if (selectedPokemon?.id === pokemonId) {
        setSelectedPokemon(null)
      }
    } catch (err) {
      setError(t.favorites.removeError)
    }
  }

  const handleOpenDetail = async (favorite) => {
    try {
      setDetailLoading(true)
      setError('')
      const pokemonData = await pokemonService.searchPokemon(favorite.pokemon_id)
      setSelectedPokemon(pokemonData)
      setDetailImageError(false)
    } catch (err) {
      setError(t.favorites.detailError)
    } finally {
      setDetailLoading(false)
    }
  }

  const handleCardImageError = (pokemonId) => {
    setCardImageErrors((prev) => ({ ...prev, [pokemonId]: true }))
  }

  const handleCloseDetail = () => {
    setIsClosingDetail(true)

    window.setTimeout(() => {
      setSelectedPokemon(null)
      setIsClosingDetail(false)
    }, 220)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-2">❤️ {t.favorites.title}</h1>
          <p className="text-gray-600 dark:text-slate-300">
            {t.favorites.countPrefix} <strong>{count}</strong> {t.favorites.countSuffix}
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-pulse-slow">
              <img src="/pokeball.svg" alt="Pokeball logo" className="w-16 h-16" />
            </div>
            <p className="mt-4 text-gray-600 dark:text-slate-300">{t.favorites.loading}</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && favorites.length === 0 && !error && (
          <div className="text-center py-12 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-lg shadow">
            <div className="text-6xl mb-4">🎯</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-2">{t.favorites.emptyTitle}</h2>
            <p className="text-gray-600 dark:text-slate-300 mb-6">
              {t.favorites.emptyText}
            </p>
            <a
              href="/dashboard"
              className="inline-block px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition"
            >
              {t.favorites.searchPokemon}
            </a>
          </div>
        )}

        {/* Favorites Grid */}
        {!loading && favorites.length > 0 && !selectedPokemon && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((favorite) => (
              <div
                key={favorite.id}
                className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition cursor-pointer"
                onClick={() => handleOpenDetail(favorite)}
              >
                <div className="p-6">
                  <div className="flex justify-center mb-4">
                    {cardImageErrors[favorite.pokemon_id] ? (
                      <div className="w-24 h-24 rounded-lg bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-600 px-2 flex items-center justify-center">
                        <p className="text-[10px] leading-tight text-gray-600 dark:text-slate-300 font-medium text-center">
                          PokeAPI no tiene la Imagen
                        </p>
                      </div>
                    ) : (
                      <img
                        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${favorite.pokemon_id}.png`}
                        alt={favorite.pokemon_name}
                        onError={() => handleCardImageError(favorite.pokemon_id)}
                        className="w-24 h-24 object-contain"
                        loading="lazy"
                      />
                    )}
                  </div>

                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100 capitalize">
                        {favorite.pokemon_name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-slate-300">
                        {t.favorites.added}{' '}
                        {new Date(favorite.added_at).toLocaleDateString(
                          language === 'es' ? 'es-ES' : 'en-US'
                        )}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation()
                        handleRemove(favorite.pokemon_id)
                      }}
                      className="text-red-600 hover:text-red-700 font-bold text-xl transition"
                      title={t.favorites.removeTitle}
                    >
                      ♥
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-slate-300">
                    <span>ID: #{favorite.pokemon_id}</span>
                    <span className="text-blue-600 font-medium">{t.favorites.viewDetails} →</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && detailLoading && (
          <div className="text-center py-12 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-lg shadow">
            <div className="inline-block animate-pulse-slow">
              <span className="text-5xl">🔎</span>
            </div>
            <p className="mt-4 text-gray-600 dark:text-slate-300">{t.favorites.loadingDetail}</p>
          </div>
        )}

        {!loading && selectedPokemon && (
          <div
            className={`relative bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden ${
              isClosingDetail ? 'animate-fade-slide-out' : 'animate-fade-slide-in'
            }`}
          >
            <button
              type="button"
              onClick={handleCloseDetail}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-200 text-xl leading-none hover:bg-gray-100 dark:hover:bg-slate-700 transition"
              title={t.favorites.closeDetails}
              aria-label={t.favorites.closeDetails}
            >
              ×
            </button>

            <div className="grid md:grid-cols-2 gap-8 p-8">
              <div className="flex flex-col items-center justify-center bg-gray-50 dark:bg-slate-800 rounded-lg p-8">
                {selectedPokemon.image_url && !detailImageError ? (
                  <img
                    src={selectedPokemon.image_url}
                    alt={selectedPokemon.name}
                    onError={() => setDetailImageError(true)}
                    className="max-w-xs h-auto object-contain"
                  />
                ) : (
                  <div className="max-w-xs w-full rounded-xl bg-gray-100 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 p-6">
                    <p className="text-base text-gray-700 dark:text-slate-100 font-semibold text-center">
                      PokeAPI no tiene la Imagen
                    </p>
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-4xl font-bold text-gray-900 dark:text-slate-100 mb-4 capitalize">{selectedPokemon.name}</h2>

                <div className="flex gap-2 mb-6">
                  {selectedPokemon.types.map((type) => (
                    <span
                      key={type}
                      className={`${typeColors[type.toLowerCase()] || 'bg-gray-400'} text-white px-3 py-1 rounded-full text-sm font-semibold`}
                    >
                      {type}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-gray-200 dark:border-slate-700">
                  <div>
                    <p className="text-gray-600 dark:text-slate-300 text-sm">ID</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">#{selectedPokemon.id}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-slate-300 text-sm">{t.pokemonSearch.height}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{(selectedPokemon.height / 10).toFixed(1)}m</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-slate-300 text-sm">{t.pokemonSearch.weight}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{(selectedPokemon.weight / 10).toFixed(1)}kg</p>
                  </div>
                  {selectedPokemon.base_experience && (
                    <div>
                      <p className="text-gray-600 dark:text-slate-300 text-sm">{t.pokemonSearch.experience}</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{selectedPokemon.base_experience}</p>
                    </div>
                  )}
                </div>

                {selectedPokemon.abilities.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-3">{t.pokemonSearch.abilities}</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedPokemon.abilities.map((ability) => (
                        <span
                          key={ability}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                        >
                          {ability}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => handleRemove(selectedPokemon.id)}
                  className="w-full py-3 bg-red-100 text-red-700 font-semibold rounded-lg hover:bg-red-200 transition"
                >
                  ♥ {t.favorites.removeTitle}
                </button>
              </div>
            </div>

            {Object.keys(selectedPokemon.stats).length > 0 && (
              <div className="px-8 py-6 bg-gray-50 dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-4">{t.pokemonSearch.stats}</h3>
                <div className="space-y-3">
                  {Object.entries(selectedPokemon.stats).map(([stat, value]) => (
                    <div key={stat}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700 dark:text-slate-300 capitalize">{stat}</span>
                        <span className="text-sm font-bold text-gray-900 dark:text-slate-100">{value}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-red-500 to-red-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min((value / 150) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
