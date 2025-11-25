import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPinIcon,
  CurrencyDollarIcon,
  HomeIcon,
  CalendarIcon,
  UserIcon,
  ArrowLeftIcon,
  HeartIcon as HeartOutline,
  ShareIcon,
  CheckCircleIcon,
  XCircleIcon,
  SparklesIcon,
  ChatBubbleLeftIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolid, StarIcon } from '@heroicons/react/24/solid'
import listingsApi from '../../api/listings.api'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const ListingDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [selectedImage, setSelectedImage] = useState(0)
  const [showContactModal, setShowContactModal] = useState(false)

  const { data: listing, isLoading } = useQuery(['listing', id], () =>
    listingsApi.getListing(id)
  )

  const { data: favorites } = useQuery('favoriteListings', () =>
    listingsApi.getFavoriteListings()
  )

  const isFavorite = favorites?.data?.some((l) => l.id === parseInt(id))

  const toggleFavoriteMutation = useMutation(() => listingsApi.toggleFavorite(id), {
    onSuccess: () => {
      queryClient.invalidateQueries('favoriteListings')
      toast.success(isFavorite ? 'Eliminado de favoritos' : '💝 Guardado en favoritos')
    },
  })

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
          <p className="text-xl font-semibold gradient-text">Cargando detalles...</p>
        </motion.div>
      </div>
    )
  }

  const room = listing?.data

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">Habitación no encontrada</p>
          <button onClick={() => navigate('/rooms')} className="btn btn-primary">
            Volver a habitaciones
          </button>
        </div>
      </div>
    )
  }

  const images = room.images || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50 to-purple-50">
      {/* Header con navegación */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/80 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-40 shadow-lg"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.button
              whileHover={{ scale: 1.05, x: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/rooms')}
              className="flex items-center gap-2 text-gray-700 hover:text-primary-500 font-medium"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              Volver
            </motion.button>
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => toggleFavoriteMutation.mutate()}
                className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all"
              >
                {isFavorite ? (
                  <HeartSolid className="h-6 w-6 text-red-500" />
                ) : (
                  <HeartOutline className="h-6 w-6 text-gray-600" />
                )}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href)
                  toast.success('Enlace copiado al portapapeles')
                }}
                className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all"
              >
                <ShareIcon className="h-6 w-6 text-gray-600" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Columna principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Galería de imágenes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              {/* Imagen principal */}
              <div className="relative h-96 bg-gray-200 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={selectedImage}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    src={
                      images[selectedImage] ||
                      `https://ui-avatars.com/api/?name=${room.title}&size=800`
                    }
                    alt={room.title}
                    className="w-full h-full object-cover"
                  />
                </AnimatePresence>

                {/* Badge de precio */}
                <motion.div
                  initial={{ x: -100 }}
                  animate={{ x: 0 }}
                  className="absolute top-6 left-6 px-6 py-3 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl"
                >
                  <div className="flex items-center gap-2">
                    <CurrencyDollarIcon className="h-6 w-6 text-green-500" />
                    <span className="text-3xl font-bold text-gray-900">{room.price}€</span>
                    <span className="text-gray-600">/mese</span>
                  </div>
                </motion.div>

                {/* Navegación de imágenes */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setSelectedImage((prev) => (prev === 0 ? images.length - 1 : prev - 1))
                      }
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/80 backdrop-blur-sm rounded-full shadow-xl hover:bg-white transition-all"
                    >
                      <ArrowLeftIcon className="h-6 w-6 text-gray-800" />
                    </button>
                    <button
                      onClick={() =>
                        setSelectedImage((prev) => (prev === images.length - 1 ? 0 : prev + 1))
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/80 backdrop-blur-sm rounded-full shadow-xl hover:bg-white transition-all"
                    >
                      <ArrowLeftIcon className="h-6 w-6 text-gray-800 rotate-180" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="p-4 grid grid-cols-6 gap-2">
                  {images.map((img, i) => (
                    <motion.button
                      key={i}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedImage(i)}
                      className={`relative h-20 rounded-xl overflow-hidden ${
                        selectedImage === i ? 'ring-4 ring-primary-500' : ''
                      }`}
                    >
                      <img src={img} alt={`Vista ${i + 1}`} className="w-full h-full object-cover" />
                      {selectedImage !== i && (
                        <div className="absolute inset-0 bg-black/30 hover:bg-black/10 transition-colors" />
                      )}
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Información principal */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-3xl shadow-xl p-8"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <motion.h1
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-4xl font-bold text-gray-900 mb-2"
                  >
                    {room.title}
                  </motion.h1>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPinIcon className="h-5 w-5 text-primary-500" />
                    <span className="text-lg">{room.location}</span>
                  </div>
                </div>
                {room.roomType && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="px-4 py-2 bg-gradient-to-r from-primary-100 to-secondary-100 text-primary-700 rounded-full text-sm font-semibold"
                  >
                    {room.roomType}
                  </motion.span>
                )}
              </div>

              {/* Descripción */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <SparklesIcon className="h-6 w-6 text-yellow-500" />
                  Descripción
                </h3>
                <p className="text-gray-700 leading-relaxed">{room.description}</p>
              </div>

              {/* Detalles rápidos */}
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl"
                >
                  <HomeIcon className="h-6 w-6 text-blue-600 mb-2" />
                  <div className="text-sm text-gray-600">Tipo</div>
                  <div className="font-semibold text-gray-900">
                    {room.roomType || 'No especificado'}
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl"
                >
                  <CalendarIcon className="h-6 w-6 text-green-600 mb-2" />
                  <div className="text-sm text-gray-600">Disponible desde</div>
                  <div className="font-semibold text-gray-900">
                    {room.availableFrom
                      ? format(new Date(room.availableFrom), "d 'de' MMMM", { locale: es })
                      : 'Inmediato'}
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl"
                >
                  <UserIcon className="h-6 w-6 text-purple-600 mb-2" />
                  <div className="text-sm text-gray-600">Propietario</div>
                  <div className="font-semibold text-gray-900">
                    {room.owner?.name || 'Verificado'}
                  </div>
                </motion.div>
              </div>

              {/* Comodidades */}
              {room.amenities && room.amenities.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                    <StarIcon className="h-6 w-6 text-yellow-500" />
                    Comodidades
                  </h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {room.amenities.map((amenity, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                      >
                        <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">{amenity}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reglas */}
              {room.rules && room.rules.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                    <XCircleIcon className="h-6 w-6 text-red-500" />
                    Reglas de la casa
                  </h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {room.rules.map((rule, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center gap-3 p-3 bg-red-50 rounded-xl"
                      >
                        <XCircleIcon className="h-5 w-5 text-red-500 flex-shrink-0" />
                        <span className="text-gray-700">{rule}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Card de contacto */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-3xl shadow-xl p-6 sticky top-24"
            >
              <div className="text-center mb-6">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                  <UserIcon className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {room.owner?.name || 'Propietario verificado'}
                </h3>
                <p className="text-gray-600 text-sm">Miembro desde 2024</p>
              </div>

              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowContactModal(true)}
                  className="w-full btn btn-primary flex items-center justify-center gap-2"
                >
                  <ChatBubbleLeftIcon className="h-5 w-5" />
                  Enviar mensaje
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full btn bg-gray-100 text-gray-700 flex items-center justify-center gap-2"
                >
                  <EnvelopeIcon className="h-5 w-5" />
                  Contactar por email
                </motion.button>
              </div>

              {/* Info adicional */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                    <span>Identidad verificada</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                    <span>Responde en menos de 1 hora</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StarIcon className="h-5 w-5 text-yellow-500" />
                    <span>4.8/5 valoración</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Card de ubicación */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-3xl shadow-xl p-6"
            >
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <MapPinIcon className="h-6 w-6 text-primary-500" />
                Ubicación
              </h3>
              <div className="aspect-video bg-gray-200 rounded-2xl mb-4 flex items-center justify-center">
                <p className="text-gray-500">Mapa de ubicación</p>
              </div>
              <p className="text-gray-700">{room.location}</p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Modal de contacto */}
      <AnimatePresence>
        {showContactModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowContactModal(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full"
            >
              <h3 className="text-2xl font-bold mb-4">Enviar mensaje</h3>
              <textarea
                placeholder="Escribe tu mensaje..."
                rows="4"
                className="w-full input-field mb-4"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowContactModal(false)}
                  className="flex-1 btn bg-gray-200 text-gray-700"
                >
                  Cancelar
                </button>
                <button className="flex-1 btn btn-primary">Enviar</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ListingDetail
