/**
 * Componente de busqueda de Pokemon.
 *
 * Permite buscar Pokemon por nombre o ID.
 */

import React, { useEffect, useMemo, useState } from 'react'
import { pokemonService, favoriteService } from '../services/api'
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

export const PokemonSearch = () => {
  const PAGE_SIZE = 50
  const API_MAX_LIMIT = 100
  const MAX_PARALLEL_REQUESTS = 4
  const CATALOG_CACHE_KEY = 'pokemon_catalog_cache_v1'
  const CATALOG_CACHE_TTL_MS = 1000 * 60 * 60 * 12

  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [pokemon, setPokemon] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isFavorite, setIsFavorite] = useState(false)
  const [allPokemonList, setAllPokemonList] = useState([])
  const [pokemonList, setPokemonList] = useState([])
  const [listLoading, setListLoading] = useState(false)
  const [isCatalogSyncing, setIsCatalogSyncing] = useState(false)
  const [isFilterPending, setIsFilterPending] = useState(false)
  const [listError, setListError] = useState('')
  const [cardImageErrors, setCardImageErrors] = useState({})
  const [detailImageError, setDetailImageError] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [isListCollapsed, setIsListCollapsed] = useState(false)
  const [isClosingDetail, setIsClosingDetail] = useState(false)
  const { language } = useLanguage()
  const t = translations[language]

  const mapListResults = (results) => {
    return results.map((item) => {
      const id = Number(item.url.split('/').filter(Boolean).pop())
      return {
        id,
        name: item.name,
        imageUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
      }
    })
  }

  const mergeCatalogLists = (baseList, incomingList) => {
    const byId = new Map(baseList.map((item) => [item.id, item]))
    incomingList.forEach((item) => {
      byId.set(item.id, item)
    })
    return Array.from(byId.values()).sort((a, b) => a.id - b.id)
  }

  const readCatalogCache = () => {
    try {
      const raw = window.localStorage.getItem(CATALOG_CACHE_KEY)
      if (!raw) {
        return []
      }

      const parsed = JSON.parse(raw)
      const isExpired = Date.now() - (parsed.timestamp || 0) > CATALOG_CACHE_TTL_MS
      if (isExpired || !Array.isArray(parsed.items)) {
        return []
      }

      return parsed.items
    } catch {
      return []
    }
  }

  const writeCatalogCache = (items) => {
    try {
      window.localStorage.setItem(
        CATALOG_CACHE_KEY,
        JSON.stringify({
          timestamp: Date.now(),
          items,
        })
      )
    } catch {
      // Si el almacenamiento falla, continuamos sin cache.
    }
  }

  const syncRemainingCatalog = async (totalCount, initialCatalog) => {
    if (initialCatalog.length >= totalCount) {
      writeCatalogCache(initialCatalog)
      return
    }

    setIsCatalogSyncing(true)

    try {
      const offsets = []
      for (let offset = initialCatalog.length; offset < totalCount; offset += API_MAX_LIMIT) {
        offsets.push(offset)
      }

      let catalogAccumulator = [...initialCatalog]

      for (let index = 0; index < offsets.length; index += MAX_PARALLEL_REQUESTS) {
        const batchOffsets = offsets.slice(index, index + MAX_PARALLEL_REQUESTS)
        const batchResponses = await Promise.all(
          batchOffsets.map((offset) => pokemonService.listPokemon(API_MAX_LIMIT, offset))
        )

        const batchItems = mapListResults(
          batchResponses.flatMap((response) => response.results || [])
        )

        catalogAccumulator = mergeCatalogLists(catalogAccumulator, batchItems)
        setAllPokemonList(catalogAccumulator)
      }

      writeCatalogCache(catalogAccumulator)
    } catch {
      // Mantenemos los datos ya cargados aunque falle la sincronizacion completa.
    } finally {
      setIsCatalogSyncing(false)
    }
  }

  const loadPokemonCatalog = async () => {
    try {
      setListLoading(true)
      setListError('')

      const cachedCatalog = readCatalogCache()
      if (cachedCatalog.length > 0) {
        setAllPokemonList(cachedCatalog)
      }

      const firstPage = await pokemonService.listPokemon(API_MAX_LIMIT, 0)
      const totalCount = firstPage.count || 0
      const firstBatch = mapListResults(firstPage.results || [])
      const startingCatalog = mergeCatalogLists(cachedCatalog, firstBatch)

      setAllPokemonList(startingCatalog)
      writeCatalogCache(startingCatalog)
      setListLoading(false)

      if (startingCatalog.length >= totalCount) {
        return
      }

      void syncRemainingCatalog(totalCount, startingCatalog)
    } catch (err) {
      setListError(t.pokemonSearch.listError)
    } finally {
      setListLoading(false)
    }
  }

  useEffect(() => {
    loadPokemonCatalog()
  }, [])

  useEffect(() => {
    setIsFilterPending(true)

    const timeoutId = window.setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim().toLowerCase())
      setIsFilterPending(false)
    }, 1000)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [searchTerm])

  useEffect(() => {
    setCurrentPage(1)
    setError('')
    setPokemon(null)
    setIsListCollapsed(false)
  }, [debouncedSearchTerm])

  const filteredPokemonList = useMemo(() => {
    if (!debouncedSearchTerm) {
      return allPokemonList
    }

    return allPokemonList.filter((item) => {
      const normalizedId = String(item.id)
      return (
        item.name.toLowerCase().includes(debouncedSearchTerm) ||
        normalizedId.includes(debouncedSearchTerm)
      )
    })
  }, [allPokemonList, debouncedSearchTerm])

  useEffect(() => {
    const offset = (currentPage - 1) * PAGE_SIZE
    setPokemonList(filteredPokemonList.slice(offset, offset + PAGE_SIZE))
  }, [filteredPokemonList, currentPage])

  const totalPokemons = filteredPokemonList.length
  const totalPages = Math.max(1, Math.ceil(totalPokemons / PAGE_SIZE))

  const fetchPokemonDetail = async (idOrName) => {
    setLoading(true)
    setError('')

    try {
      const data = await pokemonService.searchPokemon(idOrName)
      setPokemon(data)

      // Verificar si esta en favoritos
      const favorite = await favoriteService.isFavorite(data.id)
      setIsFavorite(favorite)
      return true
    } catch (err) {
      setPokemon(null)
      setError(`Pokemon "${idOrName}" ${t.pokemonSearch.notFound}`)
      return false
    } finally {
      setLoading(false)
    }
  }

  const handleCardClick = async (pokemonName) => {
    setIsListCollapsed(true)
    await fetchPokemonDetail(pokemonName)
  }

  const handleCardImageError = (pokemonId) => {
    setCardImageErrors((prev) => ({ ...prev, [pokemonId]: true }))
  }

  const handleCloseDetail = () => {
    setIsClosingDetail(true)

    window.setTimeout(() => {
      setPokemon(null)
      setError('')
      setDetailImageError(false)
      setIsListCollapsed(false)
      setIsClosingDetail(false)
    }, 220)
  }

  const handleAddFavorite = async () => {
    try {
      await favoriteService.addFavorite(pokemon.id, pokemon.name)
      setIsFavorite(true)
    } catch (err) {
      setError(t.pokemonSearch.addError)
    }
  }

  const handleRemoveFavorite = async () => {
    try {
      await favoriteService.removeFavorite(pokemon.id)
      setIsFavorite(false)
    } catch (err) {
      setError(t.pokemonSearch.removeError)
    }
  }

  return (
    <div className="w-full">
      {/* Formulario de busqueda */}
      <div className="mb-8">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t.pokemonSearch.placeholder}
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Lista de Pokemon */}
      {!isListCollapsed && (
      <section className="mb-10 animate-fade-slide-up">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100">{t.pokemonSearch.listTitle}</h3>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1 || listLoading || isFilterPending}
              className="px-2 py-1 rounded-md border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-200 text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-800"
              aria-label={t.pokemonSearch.prev}
            >
              {t.pokemonSearch.prev}
            </button>

            <p className="text-sm text-gray-600 dark:text-slate-300 min-w-24 text-center">
              {t.pokemonSearch.page} {currentPage} {t.pokemonSearch.of} {totalPages}
            </p>

            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages || listLoading || isFilterPending}
              className="px-2 py-1 rounded-md border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-200 text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-800"
              aria-label={t.pokemonSearch.next}
            >
              {t.pokemonSearch.next}
            </button>
          </div>
        </div>

        {(listLoading || isFilterPending) && (
          <div className="mb-4 py-8 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700">
            <div className="flex flex-col items-center justify-center">
              <div className="inline-block animate-pulse-slow">
                <img src="/pokeball.svg" alt="Pokeball logo" className="w-14 h-14" />
              </div>
              <p className="mt-3 text-sm text-gray-600 dark:text-slate-300 text-center">
                {listLoading ? t.pokemonSearch.listLoading : t.pokemonSearch.searching}
              </p>
            </div>
          </div>
        )}

        {!listLoading && !isFilterPending && isCatalogSyncing && (
          <p className="mb-4 text-xs text-gray-500 dark:text-slate-400 text-center">
            {t.pokemonSearch.syncingCatalog}
          </p>
        )}

        {listError && !listLoading && !isFilterPending && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
            {listError}
          </div>
        )}

        {!listLoading && !isFilterPending && !listError && pokemonList.length === 0 && (
          <div className="mb-4 p-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-700 dark:text-slate-200 text-sm">
            {t.pokemonSearch.noResults}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4">
          {pokemonList.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleCardClick(item.name)}
              className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl p-3 text-center hover:shadow-md hover:border-red-300 transition"
              title={t.pokemonSearch.cardTitle.replace('{name}', item.name)}
            >
              {cardImageErrors[item.id] ? (
                <div className="w-20 h-20 mx-auto mb-2 rounded-lg bg-gray-100 border border-gray-200 px-1 flex items-center justify-center">
                  <p className="text-[10px] leading-tight text-gray-600 dark:text-slate-300 font-medium text-center">
                    {t.pokemonSearch.imageUnavailable}
                  </p>
                </div>
              ) : (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  onError={() => handleCardImageError(item.id)}
                  className="w-20 h-20 mx-auto mb-2 object-contain"
                />
              )}
              <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 mb-1">
                #{String(item.id).padStart(3, '0')}
              </p>
              <p className="text-sm font-semibold text-gray-800 dark:text-slate-100 capitalize">{item.name}</p>
            </button>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1 || listLoading}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-800"
          >
            {t.pokemonSearch.prev}
          </button>

          <span className="text-sm text-gray-700 dark:text-slate-200">
            {currentPage} / {totalPages}
          </span>

          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages || listLoading}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-800"
          >
            {t.pokemonSearch.next}
          </button>
        </div>
      </section>
      )}

      {/* Mensaje de error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 font-medium">{error}</p>
        </div>
      )}

      {/* Loader de apertura de detalle */}
      {loading && isListCollapsed && !pokemon && (
        <div className="mb-8 text-center py-12 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl shadow-lg">
          <div className="flex flex-col items-center justify-center">
            <div className="inline-block animate-pulse-slow">
              <img src="/pokeball.svg" alt="Pokeball logo" className="w-14 h-14" />
            </div>
            <p className="mt-4 text-sm text-gray-600 dark:text-slate-300 lowercase">{t.pokemonSearch.openingPokeball}</p>
          </div>
        </div>
      )}

      {/* Tarjeta de Pokemon */}
      {pokemon && (
        <div
          className={`relative bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden ${
            isClosingDetail ? 'animate-fade-slide-out' : 'animate-fade-slide-in'
          }`}
        >
          {isListCollapsed && (
            <button
              type="button"
              onClick={handleCloseDetail}
              className="absolute top-4 right-4 z-10 inline-flex items-center justify-center w-9 h-9 rounded-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition"
              title={t.pokemonSearch.closeDetails}
              aria-label={t.pokemonSearch.closeDetails}
            >
              <svg
                viewBox="0 0 24 24"
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          )}

          <div className="grid md:grid-cols-2 gap-8 p-8">
            {/* Seccion de imagen */}
            <div className="flex flex-col items-center justify-center bg-gray-50 dark:bg-slate-800 rounded-lg p-8">
              {pokemon.image_url && !detailImageError ? (
                <img
                  src={pokemon.image_url}
                  alt={pokemon.name}
                  onError={() => setDetailImageError(true)}
                  className="max-w-xs h-auto object-contain"
                />
              ) : (
                <div className="max-w-xs w-full rounded-xl bg-gray-100 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 p-6">
                  <p className="text-base text-gray-700 dark:text-slate-100 font-semibold text-center">
                    {t.pokemonSearch.imageUnavailable}
                  </p>
                </div>
              )}
            </div>

            {/* Seccion de detalles */}
            <div>
              {/* Nombre */}
              <h2 className="text-4xl font-bold text-gray-900 dark:text-slate-100 mb-4">{pokemon.name}</h2>

              {/* Tipos */}
              <div className="flex gap-2 mb-6">
                {pokemon.types.map((type) => (
                  <span
                    key={type}
                    className={`${typeColors[type.toLowerCase()] || 'bg-gray-400'} text-white px-3 py-1 rounded-full text-sm font-semibold`}
                  >
                    {type}
                  </span>
                ))}
              </div>

              {/* Cuadricula de informacion basica */}
              <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-gray-200 dark:border-slate-700">
                <div>
                  <p className="text-gray-600 dark:text-slate-300 text-sm">ID</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">#{pokemon.id}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-slate-300 text-sm">{t.pokemonSearch.height}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{(pokemon.height / 10).toFixed(1)}m</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-slate-300 text-sm">{t.pokemonSearch.weight}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{(pokemon.weight / 10).toFixed(1)}kg</p>
                </div>
                {pokemon.base_experience && (
                  <div>
                    <p className="text-gray-600 dark:text-slate-300 text-sm">{t.pokemonSearch.experience}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{pokemon.base_experience}</p>
                  </div>
                )}
              </div>

              {/* Abilities */}
              {pokemon.abilities.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-3">{t.pokemonSearch.abilities}</h3>
                  <div className="flex flex-wrap gap-2">
                    {pokemon.abilities.map((ability) => (
                      <span
                        key={ability}
                        className="px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium"
                      >
                        {ability}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Favorite Button */}
              <div className="flex gap-2 mt-8">
                {isFavorite ? (
                  <button
                    onClick={handleRemoveFavorite}
                    className="flex-1 py-3 bg-red-100 text-red-700 font-semibold rounded-lg hover:bg-red-200 transition"
                  >
                    ♥ {t.pokemonSearch.removeFavorite}
                  </button>
                ) : (
                  <button
                    onClick={handleAddFavorite}
                    className="flex-1 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition"
                  >
                    ♡ {t.pokemonSearch.addFavorite}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Stats Section */}
          {Object.keys(pokemon.stats).length > 0 && (
            <div className="px-8 py-6 bg-gray-50 dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-4">{t.pokemonSearch.stats}</h3>
              <div className="space-y-3">
                {Object.entries(pokemon.stats).map(([stat, value]) => (
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
  )
}
