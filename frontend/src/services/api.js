/**
 * Modulo de servicio API.
 *
 * Cliente HTTP centralizado para toda la comunicacion con la API.
 * Maneja tokens de autenticacion, errores e interceptores.
 */

import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Crear instancia de axios con configuracion por defecto
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor de request para agregar token a headers
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Interceptor de response para manejar expiracion de token
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o invalido: limpiar storage y redirigir a login
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

/**
 * Endpoints de autenticacion
 */
export const authService = {
  /**
   * Registra un nuevo usuario.
   * @param {string} username - Nombre de usuario
   * @param {string} email - Email del usuario
   * @param {string} password - Contrasena del usuario
   * @returns {Promise} Respuesta con datos del usuario
   */
  register: async (username, email, password) => {
    const response = await apiClient.post('/auth/register', {
      username,
      email,
      password,
    })
    return response.data
  },

  /**
   * Inicia sesion y obtiene token de acceso.
   * @param {string} email - Email del usuario
   * @param {string} password - Contrasena del usuario
   * @returns {Promise} Respuesta con token
   */
  login: async (email, password) => {
    const response = await apiClient.post('/auth/login', {
      email,
      password,
    })
    return response.data
  },

  /**
   * Obtiene el usuario autenticado actual.
   * @returns {Promise} Datos del usuario actual
   */
  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me')
    return response.data
  },
}

/**
 * Endpoints de Pokemon
 */
export const pokemonService = {
  /**
   * Busca un Pokemon por ID o nombre.
   * @param {string|number} idOrName - ID o nombre del Pokemon
   * @returns {Promise} Datos del Pokemon
   */
  searchPokemon: async (idOrName) => {
    const response = await apiClient.get(`/pokemon/search/${idOrName}`)
    return response.data
  },

  /**
   * Obtiene lista paginada de Pokemon.
   * @param {number} limit - Elementos por pagina
   * @param {number} offset - Offset de paginacion
   * @returns {Promise} Lista de Pokemon
   */
  listPokemon: async (limit = 20, offset = 0) => {
    const response = await apiClient.get('/pokemon/list', {
      params: { limit, offset },
    })
    return response.data
  },

  /**
   * Obtiene informacion de especie de un Pokemon.
   * @param {string|number} idOrName - ID o nombre del Pokemon
   * @returns {Promise} Datos de especie
   */
  getSpecies: async (idOrName) => {
    const response = await apiClient.get(`/pokemon/species/${idOrName}`)
    return response.data
  },
}

/**
 * Endpoints de favoritos
 */
export const favoriteService = {
  /**
   * Agrega Pokemon a favoritos.
   * @param {number} pokemonId - ID del Pokemon
   * @param {string} pokemonName - Nombre del Pokemon
   * @returns {Promise} Registro de favorito
   */
  addFavorite: async (pokemonId, pokemonName) => {
    const response = await apiClient.post('/favorites/add', {
      pokemon_id: pokemonId,
      pokemon_name: pokemonName,
    })
    return response.data
  },

  /**
   * Elimina Pokemon de favoritos.
   * @param {number} pokemonId - ID del Pokemon
   * @returns {Promise} Respuesta de exito
   */
  removeFavorite: async (pokemonId) => {
    const response = await apiClient.delete(`/favorites/remove/${pokemonId}`)
    return response.data
  },

  /**
   * Obtiene la lista de Pokemon favoritos del usuario.
   * @param {number} limit - Elementos por pagina
   * @param {number} offset - Offset de paginacion
   * @returns {Promise} Lista de favoritos
   */
  getFavorites: async (limit = 50, offset = 0) => {
    const response = await apiClient.get('/favorites/list', {
      params: { limit, offset },
    })
    return response.data
  },

  /**
   * Obtiene la cantidad total de favoritos.
   * @returns {Promise} Objeto con conteo
   */
  getFavoritesCount: async () => {
    const response = await apiClient.get('/favorites/count')
    return response.data
  },

  /**
   * Verifica si un Pokemon es favorito.
   * @param {number} pokemonId - ID del Pokemon
   * @returns {Promise} Estado de favorito
   */
  isFavorite: async (pokemonId) => {
    const response = await apiClient.get(`/favorites/check/${pokemonId}`)
    return response.data.is_favorite
  },
}

/**
 * Endpoints de AI bonus
 */
export const aiService = {
  /**
   * Analiza una imagen Pokemon con modelo multimodal.
   * @param {File} imageFile - Archivo de imagen a analizar
   * @param {string} language - Idioma de salida esperado (es|en)
   * @returns {Promise} Resultado del analisis
   */
  analyzeImage: async (imageFile, language = 'es') => {
    const formData = new FormData()
    formData.append('image', imageFile)
    formData.append('language', language)

    const response = await apiClient.post('/ai/analyze-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  /**
   * Chat con contexto persistido por sesion.
   * @param {string} message - Mensaje del usuario
   * @param {string|null} sessionId - ID de sesion de chat
   * @returns {Promise} Respuesta del asistente
   */
  chat: async (message, sessionId = null) => {
    const response = await apiClient.post('/ai/chat', {
      message,
      session_id: sessionId,
    })
    return response.data
  },

  /**
   * Genera recomendaciones segun favoritos del usuario.
   * @returns {Promise} Recomendaciones inteligentes
   */
  getRecommendations: async () => {
    const response = await apiClient.get('/ai/recommendations')
    return response.data
  },
}

export default apiClient
