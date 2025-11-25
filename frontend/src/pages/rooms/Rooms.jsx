import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  MapPinIcon,
  CurrencyDollarIcon,
  AdjustmentsHorizontalIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartOutline, StarIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid'
import listingsApi from '../../api/listings.api'
import toast from 'react-hot-toast'

const Rooms = () => {
  const queryClient = useQueryClient()
  const [showFilters, setShowFilters] = useState(false)
  const [form, setForm] = useState({
    q: '',
    priceMin: '',
    priceMax: '',
    location: '',
    availableFrom: '',
    immediate: false,
    amenities: [],
    rules: [],
    roomType: '',
  })

  const [filters, setFilters] = useState({})

  const { data, isLoading, isError } = useQuery(['rooms', filters], () =>
    listingsApi.getListings({
      q: form.q?.trim() ? form.q.trim() : undefined,
      location: filters.location?.trim() || undefined,
      priceMin: filters.priceMin || undefined,
      priceMax: filters.priceMax || undefined,
      availableFrom: filters.availableFrom || undefined,
      immediate: filters.immediate || undefined,
      amenities:
        filters.amenities && filters.amenities.length
          ? filters.amenities.join(',')
          : undefined,
      rules: filters.rules && filters.rules.length ? filters.rules.join(',') : undefined,
      roomType: filters.roomType || undefined,
    })
  )

  const { data: favorites } = useQuery(
    ['favoriteListings'],
    () => listingsApi.getFavoriteListings(),
    { staleTime: 5 * 60 * 1000 }
  )

  const favoriteIds = new Set((favorites?.data || []).map((l) => l.id))

  const toggleFavoriteMutation = useMutation((id) => listingsApi.toggleFavorite(id), {
    onSuccess: () => {
      queryClient.invalidateQueries('favoriteListings')
      toast.success('💝 Lista de favoritos actualizada')
    },
  })

  const applyFilters = () => {
    setFilters({
      location: form.location,
      priceMin: form.priceMin,
      priceMax: form.priceMax,
      availableFrom: form.availableFrom,
      immediate: form.immediate,
      amenities: form.amenities,
      rules: form.rules,
      roomType: form.roomType,
    })
    setShowFilters(false)
  }

  const resetFilters = () => {
    setForm({
      q: '',
      priceMin: '',
      priceMax: '',
      location: '',
      availableFrom: '',
      immediate: false,
      amenities: [],
      rules: [],
      roomType: '',
    })
    setFilters({})
  }

  const amenitiesOptions = ['Wifi', 'Bagno privato', 'Ascensore', 'Riscaldamento', 'Scrivania']
  const rulesOptions = ['Vietato fumare', 'No animali', 'Pulizia', 'Orari tranquilli']

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50 to-purple-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-20 h-20 mx-auto mb-6 rounded-full border-4 border-t-primary-500 border-r-secondary-500 border-b-purple-500 border-l-pink-500"
          />
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-xl font-semibold gradient-text"
          >
            Caricamento camere...
          </motion.p>
        </motion.div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-center text-red-500">Errore nel caricamento delle camere</p>
      </div>
    )
  }

  const activeFiltersCount = Object.keys(filters).filter(
    (key) =>
      filters[key] !== undefined &&
      filters[key] !== '' &&
      !(Array.isArray(filters[key]) && filters[key].length === 0)
  ).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50 to-purple-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header mejorado */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2">
              Camere disponibili
            </h1>
            <p className="text-gray-600">
              {data?.data?.length || 0} opzioni trovate
            </p>
          </div>

          <Link to="/rooms/new">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn btn-primary flex items-center gap-2 shadow-xl"
            >
              <SparklesIcon className="h-5 w-5" />
              Pubblica annuncio
            </motion.button>
          </Link>
        </motion.div>

        {/* Barra de búsqueda mejorada */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-white/20">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cerca per titolo o posizione..."
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                  value={form.q}
                  onChange={(e) => setForm((f) => ({ ...f, q: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') applyFilters()
                  }}
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowFilters(!showFilters)}
                className={`relative px-6 py-4 rounded-2xl font-medium transition-all ${
                  showFilters || activeFiltersCount > 0
                    ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <AdjustmentsHorizontalIcon className="h-6 w-6" />
                {activeFiltersCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold"
                  >
                    {activeFiltersCount}
                  </motion.span>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Panel de filtros mejorado */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-8 overflow-hidden"
            >
              <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold gradient-text">Filtri avanzati</h3>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowFilters(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <XMarkIcon className="h-6 w-6 text-gray-600" />
                  </motion.button>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Ubicación */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <MapPinIcon className="h-5 w-5 text-primary-500" />
                      Posizione
                    </label>
                    <input
                      type="text"
                      placeholder="Città, quartiere..."
                      className="input-field"
                      value={form.location}
                      onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                    />
                  </motion.div>

                  {/* Precio mínimo */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                  >
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <CurrencyDollarIcon className="h-5 w-5 text-green-500" />
                      Prezzo minimo (€)
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      className="input-field"
                      value={form.priceMin}
                      onChange={(e) => setForm((f) => ({ ...f, priceMin: e.target.value }))}
                    />
                  </motion.div>

                  {/* Precio máximo */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <CurrencyDollarIcon className="h-5 w-5 text-green-500" />
                      Prezzo massimo (€)
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="Illimitato"
                      className="input-field"
                      value={form.priceMax}
                      onChange={(e) => setForm((f) => ({ ...f, priceMax: e.target.value }))}
                    />
                  </motion.div>

                  {/* Fecha disponible */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                  >
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Data di ingresso
                    </label>
                    <input
                      type="date"
                      className="input-field"
                      value={form.availableFrom}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, availableFrom: e.target.value }))
                      }
                    />
                    <label className="mt-3 inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.immediate}
                        onChange={(e) => setForm((f) => ({ ...f, immediate: e.target.checked }))}
                        className="w-5 h-5 text-primary-500 rounded focus:ring-2 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700 font-medium">
                        Disponibilità immediata
                      </span>
                    </label>
                  </motion.div>

                  {/* Tipo de habitación */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="md:col-span-2"
                  >
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Tipo di stanza
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: 'Singola', value: 'SINGLE' },
                        { label: 'Doppia', value: 'DOUBLE' },
                        { label: 'Suite', value: 'SUITE' },
                      ].map((t) => (
                        <motion.button
                          key={t.value}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          type="button"
                          onClick={() =>
                            setForm((f) => ({
                              ...f,
                              roomType: f.roomType === t.value ? '' : t.value,
                            }))
                          }
                          className={`px-6 py-3 rounded-xl text-sm font-medium transition-all ${
                            form.roomType === t.value
                              ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {t.label}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                </div>

                {/* Comodidades */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="mt-6"
                >
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <StarIcon className="h-5 w-5 text-yellow-500" />
                    Servizi
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {amenitiesOptions.map((a) => (
                      <motion.button
                        key={a}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={() =>
                          setForm((f) => ({
                            ...f,
                            amenities: f.amenities.includes(a)
                              ? f.amenities.filter((x) => x !== a)
                              : [...f.amenities, a],
                          }))
                        }
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          form.amenities.includes(a)
                            ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {a}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>

                {/* Reglas */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mt-6"
                >
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Regole della casa
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {rulesOptions.map((r) => (
                      <motion.button
                        key={r}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={() =>
                          setForm((f) => ({
                            ...f,
                            rules: f.rules.includes(r)
                              ? f.rules.filter((x) => x !== r)
                              : [...f.rules, r],
                          }))
                        }
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          form.rules.includes(r)
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {r}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>

                {/* Botones de acción */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                  className="flex gap-4 mt-8"
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={applyFilters}
                    className="flex-1 btn btn-primary"
                  >
                    Applica filtri
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={resetFilters}
                    className="flex-1 btn bg-gray-200 text-gray-700"
                  >
                    Pulisci tutto
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Grid de habitaciones */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.data?.map((room, index) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all cursor-pointer"
            >
              {/* Imagen */}
              <div className="relative h-56 overflow-hidden">
                <motion.img
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                  src={
                    room.images?.[0] ||
                    `https://ui-avatars.com/api/?name=${room.title}&size=400`
                  }
                  alt={room.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Badge de precio */}
                <motion.div
                  initial={{ x: -100 }}
                  animate={{ x: 0 }}
                  className="absolute top-4 left-4 px-4 py-2 bg-white/95 backdrop-blur-sm rounded-full shadow-lg"
                >
                  <div className="flex items-center gap-1">
                    <CurrencyDollarIcon className="h-4 w-4 text-green-500" />
                    <span className="font-bold text-gray-900">{room.price}€</span>
                    <span className="text-sm text-gray-600">/mese</span>
                  </div>
                </motion.div>

                {/* Botón de favorito */}
                <motion.button
                  initial={{ x: 100 }}
                  animate={{ x: 0 }}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.preventDefault()
                    toggleFavoriteMutation.mutate(room.id)
                  }}
                  className="absolute top-4 right-4 p-3 bg-white/95 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all"
                >
                  {favoriteIds.has(room.id) ? (
                    <HeartSolid className="h-6 w-6 text-red-500" />
                  ) : (
                    <HeartOutline className="h-6 w-6 text-gray-600 hover:text-red-500" />
                  )}
                </motion.button>
              </div>

              {/* Contenido */}
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
                  {room.title}
                </h2>

                <div className="flex items-center gap-2 text-gray-600 mb-4">
                  <MapPinIcon className="h-5 w-5 text-primary-500" />
                  <span className="text-sm">{room.location}</span>
                </div>

                {/* Comodidades */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {(room.amenities || []).slice(0, 3).map((a, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 + i * 0.1 }}
                      className="px-3 py-1 bg-gradient-to-r from-primary-100 to-secondary-100 text-primary-700 rounded-full text-xs font-medium"
                    >
                      {a}
                    </motion.span>
                  ))}
                  {(room.amenities || []).length > 3 && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                      +{(room.amenities || []).length - 3}
                    </span>
                  )}
                </div>

                {/* Botón ver detalles */}
                <Link to={`/rooms/${room.id}`} className="block">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full btn btn-primary"
                  >
                    Vedi dettagli
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Estado vacío */}
        {data?.data?.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-gray-200 to-gray-300 rounded-3xl flex items-center justify-center">
              <span className="text-6xl">🏠</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Nessuna camera trovata
            </h3>
            <p className="text-gray-600 mb-6">
              Prova a regolare i filtri o cerca in un’altra posizione
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={resetFilters}
              className="btn btn-primary"
            >
              Pulisci filtri
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default Rooms
