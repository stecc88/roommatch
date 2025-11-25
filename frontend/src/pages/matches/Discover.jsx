import { useState, useMemo } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import { HeartIcon, XMarkIcon, SparklesIcon, StarIcon } from '@heroicons/react/24/solid'
import {
  MapPinIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  UserCircleIcon,
  ArrowPathIcon,
  FlagIcon,
  CalendarDaysIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import { useQuery, useMutation } from 'react-query'
import matchesApi from '../../api/matches.api'
import authApi from '../../api/auth.api'
import { useT } from '../../i18n/i18n.jsx'

const Discover = () => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(null)
  const [viewMode, setViewMode] = useState('grid')
  const [reportOpen, setReportOpen] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [reportSending, setReportSending] = useState(false)
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-25, 25])
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0])
  const likeOpacity = useTransform(x, [0, 100], [0, 1])
  const nopeOpacity = useTransform(x, [-100, 0], [1, 0])

  const { t } = useT()

  const { data: profiles, isLoading, refetch } = useQuery(
    'discoverUsers',
    () => matchesApi.getDiscoverUsers(),
    { onError: () => toast.error('Error al cargar perfiles') }
  )

  const { data: meProfile } = useQuery('meProfile', () => authApi.getProfile())

  const currentProfile = profiles?.data?.[currentIndex]


  const computeBreakdown = useMemo(() => {
    if (!currentProfile || !meProfile?.data) return null
    const me = meProfile.data

    const age = (d) => (d ? new Date().getFullYear() - new Date(d).getFullYear() : null)
    const a1 = age(me.birthDate), a2 = age(currentProfile.birthDate)
    const ageScore = a1 && a2 ? Math.max(0, 100 - Math.min(40, Math.abs(a1 - a2) * 5)) : 0

    const interOverlap = (me.interests || []).filter((x) => (currentProfile.interests || []).includes(x)).length
    const interScore = Math.min(100, Math.round((interOverlap / Math.max(1, (me.interests || []).length)) * 100))

    const langOverlap = (me.languages || []).filter((x) => (currentProfile.languages || []).includes(x)).length
    const langScore = Math.min(100, Math.round((langOverlap / Math.max(1, (me.languages || []).length)) * 100))

    const moveDateScore = me.quiereMudarseDesde && currentProfile.quiereMudarseDesde ? 100 : 0

    const lifestyleKeys = ['actividadSocial', 'mascotas', 'huespedes', 'presenciaCasa', 'fuma', 'limpieza']
    const lifeMatchCount = lifestyleKeys.reduce((acc, k) => acc + (me.lifestyle?.[k] && currentProfile.lifestyle?.[k] && me.lifestyle[k] === currentProfile.lifestyle[k] ? 1 : 0), 0)
    const lifeScore = Math.round((lifeMatchCount / lifestyleKeys.length) * 100)

    return [
      { label: 'Fecha de mudanza', value: moveDateScore },
      { label: 'Edad', value: ageScore },
      { label: 'Intereses', value: interScore },
      { label: 'Idiomas', value: langScore },
      { label: 'Limpieza', value: lifeScore },
      { label: 'Fuma', value: lifeScore },
      { label: 'Presencia en casa', value: lifeScore },
      { label: 'Actividad social', value: lifeScore },
      { label: 'Animales', value: lifeScore },
      { label: 'Huéspedes', value: lifeScore },
    ]
  }, [currentProfile, meProfile])


  const swipeMutation = useMutation(
    ({ targetUserId }) => matchesApi.like({ targetUserId }),
    {
      onSuccess: (data) => {
        if (data.data?.match) {
          toast.success('¡Es un match! 🎉', {
            icon: '💕',
            style: {
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: '#fff',
            },
          })
        }
      },
    }
  )

  const handleSwipe = async (swipeDirection) => {
    if (!profiles?.data || currentIndex >= profiles.data.length) return
    const currentProfile = profiles.data[currentIndex]

    setDirection(swipeDirection)

    if (swipeDirection === 'right') {
      await swipeMutation.mutateAsync({ targetUserId: currentProfile.id })
    }

    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1)
      setDirection(null)
      x.set(0)
    }, 300)
  }

  const handleReset = () => {
    setCurrentIndex(0)
    refetch()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center">
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
            Buscando perfiles perfectos...
          </motion.p>
        </motion.div>
      </div>
    )
  }

  
  const profileAge = currentProfile?.birthDate
    ? new Date().getFullYear() - new Date(currentProfile.birthDate).getFullYear()
    : null
  const calcAge = (d) => (d ? new Date().getFullYear() - new Date(d).getFullYear() : null)
  const handleLikeUser = async (id) => {
    try {
      await swipeMutation.mutateAsync({ targetUserId: id })
    } catch {}
  }

  

  const lifestyleLabels = {
    actividadSocial: {
      A_VECES_INVITA: 'A veces invita amigos',
      TRANQUILO: 'Ambiente tranquilo',
      MUY_SOCIAL: 'Muy social',
    },
    mascotas: {
      ACEPTA: 'Acepta mascotas',
      NO_ACEPTA: 'No acepta mascotas',
      LE_GUSTAN: 'Le gustan las mascotas',
    },
    huespedes: {
      A_VECES: 'A veces hay huéspedes',
      CASI_NUNCA: 'Casi nunca huéspedes',
      FRECUENTEMENTE: 'Frecuentemente huéspedes',
    },
    presenciaCasa: {
      MUCHO_EN_CASA: 'Mucho en casa',
      SIEMPRE_AFUERA: 'Más fuera que en casa',
      EQUILIBRADO: 'Tiempo equilibrado',
    },
    fuma: {
      SI: 'Fumador',
      NO: 'No fumador',
    },
    limpieza: {
      MUY_ORDENADO: 'Espacios muy ordenados',
      NORMAL: 'Limpieza normal',
    },
  }

  if (!currentProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center bg-white rounded-3xl p-12 shadow-2xl max-w-md"
        >
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center"
          >
            <SparklesIcon className="h-12 w-12 text-white" />
          </motion.div>
          <h2 className="text-3xl font-bold gradient-text mb-4">
            ¡Has visto todos los perfiles!
          </h2>
          <p className="text-gray-600 mb-8">Vuelve más tarde para ver nuevos matches</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleReset}
            className="btn btn-primary flex items-center gap-2 mx-auto"
          >
            <ArrowPathIcon className="h-5 w-5" />
            Volver a empezar
          </motion.button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 relative overflow-hidden py-8">
      {/* Efectos de fondo animados */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 0.5, 0],
              scale: [0, 1.5, 0],
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
            className={`absolute w-20 h-20 rounded-full ${
              i % 3 === 0
                ? 'bg-pink-300'
                : i % 3 === 1
                ? 'bg-purple-300'
                : 'bg-blue-300'
            } blur-xl`}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold gradient-text mb-2">Descubrir</h1>
          <p className="text-gray-600">Explora perfiles compatibles</p>
          <div className="mt-4 inline-flex rounded-full bg-gray-100 p-1">
            <button
              className={`px-4 py-1 rounded-full text-sm ${viewMode === 'grid' ? 'bg-white shadow font-semibold' : 'text-gray-600'}`}
              onClick={() => setViewMode('grid')}
            >
              Tarjetas
            </button>
          </div>
        </motion.div>

        <div className="max-w-md mx-auto perspective-1000">
          <div className="relative h-[600px]">
            <AnimatePresence>
              <motion.div
                key={currentProfile.id}
                style={{ x, rotate, opacity }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.7}
                onDragEnd={(e, { offset, velocity }) => {
                  const swipe = Math.abs(offset.x) * velocity.x
                  if (swipe > 5000) {
                    handleSwipe(offset.x > 0 ? 'right' : 'left')
                  } else {
                    x.set(0)
                  }
                }}
                initial={{ scale: 0.8, opacity: 0, rotateY: -30 }}
                animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                exit={{
                  x: direction === 'right' ? 300 : -300,
                  opacity: 0,
                  scale: 0.8,
                  transition: { duration: 0.3 },
                }}
                className="absolute w-full cursor-grab active:cursor-grabbing"
              >
                <motion.div whileHover={{ scale: 1.02 }} className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                  <div className="relative h-96 overflow-hidden">
                    <motion.img
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5 }}
                      src={
                        currentProfile.profilePhotos?.[0] ||
                        `https://ui-avatars.com/api/?name=${currentProfile.name}&size=600`
                      }
                      alt={currentProfile.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                    <div className="absolute top-6 left-6">
                      <div className="flex items-center gap-2">
                        <div className="relative w-14 h-14">
                          <svg viewBox="0 0 36 36" className="w-14 h-14">
                            <path d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831" fill="none" stroke="#22c55e" strokeWidth="3" strokeDasharray={`${Math.max(0, Math.min(100, currentProfile.compatibility || 0))}, 100`} />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-sm font-bold text-white">{currentProfile.compatibility || 0}%</span>
                          </div>
                        </div>
                        <span className="text-white/90 text-sm">{t('discover.compatibility')}</span>
                      </div>
                    </div>
                    <motion.div style={{ opacity: likeOpacity }} className="absolute top-6 left-6 px-6 py-3 rounded-2xl border-4 border-green-500 bg-green-500/20 backdrop-blur-sm">
                      <span className="text-green-500 text-2xl font-extrabold">LIKE</span>
                    </motion.div>
                    <motion.div style={{ opacity: nopeOpacity }} className="absolute top-6 right-6 px-6 py-3 rounded-2xl border-4 border-red-500 bg-red-500/20 backdrop-blur-sm">
                      <span className="text-red-500 text-2xl font-extrabold">NOPE</span>
                    </motion.div>
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                        <div className="flex items-end justify-between mb-3">
                          <div>
                            <h2 className="text-4xl font-bold text-white mb-1">
                              {currentProfile.name}{profileAge ? `, ${profileAge}` : ''}
                            </h2>
                            <div className="flex items-center gap-2 text-white/90">
                              <MapPinIcon className="h-5 w-5" />
                              <span className="text-lg">{currentProfile.ciudadBusquedaPiso}</span>
                            </div>
                            <div className="mt-2 grid grid-cols-2 gap-2 text-white/90">
                              <div className="flex items-center gap-2">
                                <CalendarDaysIcon className="h-5 w-5" />
                                <span>{currentProfile.quiereMudarseDesde ? new Date(currentProfile.quiereMudarseDesde).toLocaleDateString() : ''}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <BanknotesIcon className="h-5 w-5" />
                                <span>{t('discover.budget')}: €{currentProfile.presupuestoAproximado || 0}/mes</span>
                              </div>
                              <div className="flex items-center gap-2">
                                {(currentProfile.universidadEscuela && !currentProfile.occupation) ? (
                                  <AcademicCapIcon className="h-5 w-5" />
                                ) : (
                                  <BriefcaseIcon className="h-5 w-5" />
                                )}
                                <span>{currentProfile.universidadEscuela ? t('discover.student') : (currentProfile.occupation || '')}</span>
                              </div>
                              {currentProfile.universidadEscuela && (
                                <div className="flex items-center gap-2">
                                  <AcademicCapIcon className="h-5 w-5" />
                                  <span>{currentProfile.universidadEscuela}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.3 }} className="flex items-center gap-1 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full">
                            <StarIcon className="h-5 w-5 text-yellow-400" />
                            <span className="text-white font-bold text-lg">{currentProfile.compatibility || 0}%</span>
                          </motion.div>
                        </div>
                        <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${currentProfile.compatibility || 0}%` }} transition={{ duration: 1, delay: 0.5 }} className="h-full rounded-full" style={{ background: currentProfile.compatibility >= 70 ? 'linear-gradient(90deg, #10b981, #34d399)' : currentProfile.compatibility >= 50 ? 'linear-gradient(90deg, #f59e0b, #fbbf24)' : 'linear-gradient(90deg, #ef4444, #f87171)' }} />
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="flex justify-center items-center gap-6 mt-8">
            <motion.button whileHover={{ scale: 1.1, rotate: -5 }} whileTap={{ scale: 0.9 }} onClick={() => handleSwipe('left')} className="w-20 h-20 bg-white rounded-full shadow-2xl flex items-center justify-center hover:shadow-red-500/50 transition-shadow">
              <XMarkIcon className="h-10 w-10 text-red-500" />
            </motion.button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => toast('Pronto')} className="w-20 h-20 bg-white rounded-full shadow-2xl flex items-center justify-center hover:shadow-gray-400/50 transition-shadow">
              <FlagIcon className="h-10 w-10 text-gray-500" />
            </motion.button>
            <motion.button whileHover={{ scale: 1.1, rotate: 5 }} whileTap={{ scale: 0.9 }} onClick={() => handleSwipe('right')} className="w-20 h-20 bg-white rounded-full shadow-2xl flex items-center justify-center hover:shadow-green-500/50 transition-shadow">
              <HeartIcon className="h-10 w-10 text-green-500" />
            </motion.button>
          </motion.div>

          <div className="mt-10 max-w-2xl mx-auto bg-white rounded-3xl shadow-xl p-6 space-y-8">
            <div>
              <h3 className="text-2xl font-bold mb-2">{t('info')}</h3>
              <p className="text-gray-700 leading-relaxed">{currentProfile.bio || 'Sin biografía disponible'}</p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-2">{t('origin')}</h3>
              <div className="flex items-center gap-2 text-gray-700">
                <FlagIcon className="h-5 w-5 text-orange-500" />
                <span>{currentProfile.origen || 'No especificado'}</span>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-3">{t('lifestyle.presenceHome').split(' ')[0]} di vita</h3>
              <div className="grid grid-cols-2 gap-3">
                {['actividadSocial','mascotas','huespedes','presenciaCasa','fuma','limpieza'].map((k) => (
                  <div key={k} className="p-4 rounded-2xl bg-gray-50">
                    <div className="text-xs font-semibold text-orange-500 mb-1">
                      {k === 'actividadSocial' ? t('lifestyle.activitySocial') : k === 'mascotas' ? t('lifestyle.pets') : k === 'huespedes' ? t('lifestyle.guests') : k === 'presenciaCasa' ? t('lifestyle.presenceHome') : k === 'fuma' ? t('lifestyle.smokes') : t('lifestyle.cleaning')}
                    </div>
                    <div className="text-gray-700">
                      {lifestyleLabels[k]?.[currentProfile.lifestyle?.[k]] || 'Sin especificar'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {!!(currentProfile.interests && currentProfile.interests.length) && (
              <div>
                <h3 className="text-xl font-bold mb-3">{t('interests')}</h3>
                <div className="flex flex-wrap gap-2">
                  {(currentProfile.interests || []).map((i, idx) => (
                    <span key={idx} className="px-3 py-1 bg-gray-100 rounded-full text-sm">{i}</span>
                  ))}
                </div>
              </div>
            )}

            {!!(currentProfile.languages && currentProfile.languages.length) && (
              <div>
                <h3 className="text-xl font-bold mb-3">{t('languages')}</h3>
                <div className="flex flex-wrap gap-2">
                  {(currentProfile.languages || []).map((l, idx) => (
                    <span key={idx} className="px-3 py-1 bg-gray-100 rounded-full text-sm">{l}</span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="text-xl font-bold mb-3">{t('compatibilityDetail')}</h3>
              <div className="space-y-3">
                {(computeBreakdown || []).map((row, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between text-sm text-gray-700 mb-1">
                      <span>{row.label}</span>
                      <span>{row.value}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${row.value}%` }} transition={{ duration: 0.6 }} className="h-full rounded-full" style={{ background: row.value >= 70 ? '#16a34a' : row.value >= 30 ? '#22c55e' : '#ef4444' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
  )
}

export default Discover
