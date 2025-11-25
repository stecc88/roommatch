import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CameraIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  Cog6ToothIcon,
  HeartIcon,
  SparklesIcon,
  CheckBadgeIcon,
  FireIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  CalendarIcon,
  BriefcaseIcon,
  GlobeAltIcon,
  MusicalNoteIcon,
  BookOpenIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline'
import {
  HeartIcon as HeartSolid,
  StarIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/solid'
import toast from 'react-hot-toast'
import authApi from '../../api/auth.api'
import { useQuery } from 'react-query'
import matchesApi from '../../api/matches.api'

const Profile = () => {
  const { user, updateUser } = useAuth()
  const [editing, setEditing] = useState(false)
  const [activeTab, setActiveTab] = useState('about')
  const [hoveredBadge, setHoveredBadge] = useState(null)

  const { data: matches } = useQuery('matches', () => matchesApi.getMatches())
  const matchCount = matches?.data?.length || 0

  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    occupation: user?.occupation || '',
    birthDate: user?.birthDate ? new Date(user.birthDate).toISOString().split('T')[0] : '',
    gender: user?.gender || '',
    city: Array.isArray(user?.preferences?.preferredLocations) ? (user.preferences.preferredLocations[0] || '') : '',
    budgetMin: user?.preferences?.budgetMin || '',
    budgetMax: user?.preferences?.budgetMax || '',
    smoker: user?.lifestyle?.smoker || false,
    pets: user?.lifestyle?.pets || false,
    schedule: user?.lifestyle?.schedule || 'diurno',
    interests: user?.interests || [],
    languages: user?.languages || [],
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const data = new FormData()
      data.append('name', formData.name)
      data.append('bio', formData.bio)
      data.append('occupation', formData.occupation)
      data.append('birthDate', formData.birthDate)
      data.append('gender', formData.gender)
      const lifestyle = { smoker: formData.smoker, pets: formData.pets, schedule: formData.schedule }
      const preferences = {
        budgetMin: Number(formData.budgetMin || 0),
        budgetMax: Number(formData.budgetMax || 0),
        preferredLocations: formData.city ? [formData.city] : [],
      }
      data.append('lifestyle', JSON.stringify(lifestyle))
      data.append('preferences', JSON.stringify(preferences))
      if (formData.interests.length) data.append('interests', JSON.stringify(formData.interests))
      if (formData.languages.length) data.append('languages', JSON.stringify(formData.languages))
      if (formData.avatar) {
        data.append('avatar', formData.avatar)
      }

      const response = await authApi.updateProfile(data)
      updateUser(response.data)
      toast.success('✨ Perfil actualizado correctamente')
      setEditing(false)
    } catch (error) {
      console.error(error)
      toast.error('Error al actualizar perfil')
    }
  }

  const calculateAge = (birthDate) => {
    if (!birthDate) return 'N/A'
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const m = today.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  const badges = [
    {
      id: 'verified',
      icon: CheckBadgeIcon,
      label: 'Verificado',
      color: 'from-blue-500 to-cyan-500',
      earned: true,
      description: 'Perfil verificado con documento',
    },
    {
      id: 'popular',
      icon: FireIcon,
      label: 'Popular',
      color: 'from-orange-500 to-red-500',
      earned: matchCount > 5,
      description: 'Más de 5 matches conseguidos',
    },
    {
      id: 'social',
      icon: UserGroupIcon,
      label: 'Social',
      color: 'from-purple-500 to-pink-500',
      earned: matchCount > 10,
      description: 'Gran actividad social',
    },
    {
      id: 'earlybird',
      icon: SparklesIcon,
      label: 'Early Bird',
      color: 'from-yellow-500 to-orange-500',
      earned: true,
      description: 'Usuario desde el principio',
    },
  ]

  const stats = [
    { label: 'Matches', value: matchCount, icon: HeartSolid, color: 'text-pink-500' },
    { label: 'Perfil visto', value: '124', icon: GlobeAltIcon, color: 'text-blue-500' },
    { label: 'Compatibilidad', value: '87%', icon: StarIcon, color: 'text-yellow-500' },
    { label: 'Respuestas', value: '95%', icon: ChatBubbleLeftRightIcon, color: 'text-green-500' },
  ]

  const interestOptions = [
    'Música',
    'Deportes',
    'Cine',
    'Lectura',
    'Viajes',
    'Cocina',
    'Gaming',
    'Arte',
    'Tecnología',
    'Fotografía',
  ]

  const languageOptions = ['Español', 'Inglés', 'Francés', 'Alemán', 'Italiano', 'Portugués', 'Chino', 'Japonés']

  const toggleInterest = (interest) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }))
  }

  const toggleLanguage = (language) => {
    setFormData((prev) => ({
      ...prev,
      languages: prev.languages.includes(language)
        ? prev.languages.filter((l) => l !== language)
        : [...prev.languages, language],
    }))
  }

  const tabs = [
    { id: 'about', label: 'Su di me', icon: BookOpenIcon },
    { id: 'lifestyle', label: 'Stile di vita', icon: HeartIcon },
    { id: 'achievements', label: 'Traguardi', icon: TrophyIcon },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50 to-purple-50 relative overflow-hidden">
      {/* Efectos de fondo animados */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-primary-400/30 to-secondary-400/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-purple-400/30 to-pink-400/30 rounded-full blur-3xl"
        />
      </div>

      <div className="relative">
        {/* Header con banner */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative h-64 bg-gradient-to-r from-primary-600 via-secondary-600 to-purple-600 overflow-hidden"
        >
          <motion.div
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 bg-gradient-to-r from-primary-600 via-secondary-600 to-purple-600 bg-[length:200%_100%]"
          />
          <div className="absolute inset-0 bg-black/10" />

          {/* Partículas decorativas */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 0 }}
              animate={{
                opacity: [0, 1, 0],
                y: [-20, -300],
                x: Math.random() * 50 - 25,
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 5,
              }}
              className="absolute bottom-0 w-2 h-2 bg-white/50 rounded-full"
              style={{ left: `${Math.random() * 100}%` }}
            />
          ))}
        </motion.div>

        <div className="container mx-auto px-4 -mt-32 relative z-10">
          {/* Card principal del perfil */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20"
          >
            {/* Sección superior con avatar y acciones */}
            <div className="p-8 md:p-10">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                {/* Avatar y nombre */}
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="relative group"
                  >
                    <motion.div
                      animate={{
                        boxShadow: [
                          '0 0 0 0 rgba(var(--primary-500), 0)',
                          '0 0 0 20px rgba(var(--primary-500), 0)',
                        ],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 rounded-full"
                    />
                    <div className="relative w-36 h-36 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white shadow-2xl">
                      <img
                        src={
                          formData.avatarPreview ||
                          user?.avatar ||
                          `https://ui-avatars.com/api/?name=${user?.name}&size=256`
                        }
                        alt={user?.name}
                        className="w-full h-full object-cover"
                      />
                      {editing && (
                        <motion.label
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          htmlFor="avatar-upload"
                          className="absolute inset-0 bg-black/60 flex items-center justify-center cursor-pointer backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <CameraIcon className="h-10 w-10 text-white" />
                        </motion.label>
                      )}
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files[0]
                          if (file) {
                            setFormData({
                              ...formData,
                              avatar: file,
                              avatarPreview: URL.createObjectURL(file),
                            })
                          }
                        }}
                      />
                    </div>
                    {/* Badge de verificación en el avatar */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute bottom-2 right-2 bg-blue-500 rounded-full p-2 shadow-lg"
                    >
                      <CheckBadgeIcon className="h-6 w-6 text-white" />
                    </motion.div>
                  </motion.div>

                  <div className="text-center md:text-left">
                    <motion.h1
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-4xl font-bold gradient-text mb-2"
                    >
                      {user?.name}
                    </motion.h1>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      className="flex items-center justify-center md:justify-start gap-2 text-gray-600 mb-3"
                    >
                      <MapPinIcon className="h-5 w-5" />
                      <span>{formData.city || 'Ciudad no especificada'}</span>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="flex items-center justify-center md:justify-start gap-2 text-gray-600 mb-4"
                    >
                      <BriefcaseIcon className="h-5 w-5" />
                      <span>{user?.occupation || 'Ocupación no especificada'}</span>
                    </motion.div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                      {badges
                        .filter((b) => b.earned)
                        .map((badge, i) => (
                          <motion.div
                            key={badge.id}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 + i * 0.1 }}
                            onHoverStart={() => setHoveredBadge(badge.id)}
                            onHoverEnd={() => setHoveredBadge(null)}
                            className="relative"
                          >
                            <motion.div
                              whileHover={{ scale: 1.1, rotate: 5 }}
                              className={`p-2 rounded-xl bg-gradient-to-r ${badge.color} text-white shadow-lg cursor-pointer`}
                            >
                              <badge.icon className="h-5 w-5" />
                            </motion.div>
                            <AnimatePresence>
                              {hoveredBadge === badge.id && (
                                <motion.div
                                  initial={{ opacity: 0, y: 5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: 5 }}
                                  className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap shadow-xl"
                                >
                                  {badge.description}
                                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        ))}
                    </div>
                  </div>
                </div>

                {/* Botones de acción */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex gap-3"
                >
                  {!editing ? (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setEditing(true)}
                        className="btn btn-primary flex items-center gap-2"
                      >
                        <Cog6ToothIcon className="h-5 w-5" />
                        Editar perfil
                      </motion.button>
                    </>
                  ) : (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setEditing(false)}
                        className="btn bg-gray-200 text-gray-700"
                      >
                        Cancelar
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSubmit}
                        className="btn btn-primary flex items-center gap-2"
                      >
                        <CheckCircleIcon className="h-5 w-5" />
                        Guardar
                      </motion.button>
                    </>
                  )}
                </motion.div>
              </div>

              {/* Estadísticas */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8"
              >
                {stats.map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-4 shadow-lg border border-gray-100"
                  >
                    <stat.icon className={`h-8 w-8 ${stat.color} mb-2`} />
                    <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Tabs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex gap-2 mt-8 border-b border-gray-200"
              >
                {tabs.map((tab) => (
                  <motion.button
                    key={tab.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'text-primary-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <tab.icon className="h-5 w-5" />
                    {tab.label}
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"
                      />
                    )}
                  </motion.button>
                ))}
              </motion.div>

              {/* Contenido de tabs */}
              <AnimatePresence mode="wait">
                {activeTab === 'about' && (
                  <motion.div
                    key="about"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="mt-8 space-y-6"
                  >
                    {editing ? (
                      <>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Nombre
                            </label>
                            <input
                              type="text"
                              className="input-field"
                              value={formData.name}
                              onChange={(e) =>
                                setFormData({ ...formData, name: e.target.value })
                              }
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Ocupación
                            </label>
                            <input
                              type="text"
                              className="input-field"
                              value={formData.occupation}
                              onChange={(e) =>
                                setFormData({ ...formData, occupation: e.target.value })
                              }
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Fecha de nacimiento
                            </label>
                            <input
                              type="date"
                              className="input-field"
                              value={formData.birthDate}
                              onChange={(e) =>
                                setFormData({ ...formData, birthDate: e.target.value })
                              }
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Género
                            </label>
                            <select
                              className="input-field"
                              value={formData.gender}
                              onChange={(e) =>
                                setFormData({ ...formData, gender: e.target.value })
                              }
                            >
                              <option value="">Selecciona...</option>
                              <option value="male">Masculino</option>
                              <option value="female">Femenino</option>
                              <option value="other">Otro</option>
                            </select>
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Ciudad
                            </label>
                            <input
                              type="text"
                              className="input-field"
                              value={formData.city}
                              onChange={(e) =>
                                setFormData({ ...formData, city: e.target.value })
                              }
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Biografía
                          </label>
                          <textarea
                            rows="4"
                            className="input-field"
                            value={formData.bio}
                            onChange={(e) =>
                              setFormData({ ...formData, bio: e.target.value })
                            }
                            placeholder="Cuéntanos sobre ti..."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Intereses
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {interestOptions.map((interest) => (
                              <motion.button
                                key={interest}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => toggleInterest(interest)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                  formData.interests.includes(interest)
                                    ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                              >
                                {interest}
                              </motion.button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Idiomas
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {languageOptions.map((language) => (
                              <motion.button
                                key={language}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => toggleLanguage(language)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                  formData.languages.includes(language)
                                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                              >
                                {language}
                              </motion.button>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg border border-gray-100">
                          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <BookOpenIcon className="h-6 w-6 text-primary-500" />
                            Biografía
                          </h3>
                          <p className="text-gray-700 leading-relaxed">
                            {user?.bio || 'Sin biografía'}
                          </p>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg border border-gray-100">
                            <h3 className="text-lg font-semibold mb-4">Datos personales</h3>
                            <div className="space-y-3">
                              <div className="flex items-center gap-3">
                                <CalendarIcon className="h-5 w-5 text-primary-500" />
                                <span className="text-gray-700">
                                  {calculateAge(user?.birthDate)} años
                                </span>
                              </div>
                              <div className="flex items-center gap-3">
                                <BriefcaseIcon className="h-5 w-5 text-primary-500" />
                                <span className="text-gray-700">
                                  {user?.occupation || 'No especificado'}
                                </span>
                              </div>
                              <div className="flex items-center gap-3">
                                <MapPinIcon className="h-5 w-5 text-primary-500" />
                                <span className="text-gray-700">
                                  {formData.city || 'No especificado'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg border border-gray-100">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                              <MusicalNoteIcon className="h-6 w-6 text-secondary-500" />
                              Intereses
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {(user?.interests || []).map((interest) => (
                                <motion.span
                                  key={interest}
                                  initial={{ opacity: 0, scale: 0 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  whileHover={{ scale: 1.1 }}
                                  className="px-4 py-2 bg-gradient-to-r from-primary-100 to-secondary-100 text-primary-700 rounded-full text-sm font-medium shadow"
                                >
                                  {interest}
                                </motion.span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg border border-gray-100">
                          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <GlobeAltIcon className="h-6 w-6 text-blue-500" />
                            Idiomas
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {(user?.languages || []).map((language) => (
                              <motion.span
                                key={language}
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                whileHover={{ scale: 1.1 }}
                                className="px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-sm font-medium shadow"
                              >
                                {language}
                              </motion.span>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}

                {activeTab === 'lifestyle' && (
                  <motion.div
                    key="lifestyle"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="mt-8 space-y-6"
                  >
                    {editing ? (
                      <>
                        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg border border-gray-100">
                          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <HeartIcon className="h-6 w-6 text-pink-500" />
                            Preferencias de convivencia
                          </h3>
                          <div className="grid md:grid-cols-2 gap-6">
                            <label className="flex items-center gap-3 cursor-pointer group">
                              <input
                                type="checkbox"
                                checked={formData.smoker}
                                onChange={(e) =>
                                  setFormData({ ...formData, smoker: e.target.checked })
                                }
                                className="w-5 h-5 text-primary-500 rounded focus:ring-2 focus:ring-primary-500"
                              />
                              <span className="text-gray-700 group-hover:text-primary-500 transition-colors">
                                Fumar
                              </span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer group">
                              <input
                                type="checkbox"
                                checked={formData.pets}
                                onChange={(e) =>
                                  setFormData({ ...formData, pets: e.target.checked })
                                }
                                className="w-5 h-5 text-primary-500 rounded focus:ring-2 focus:ring-primary-500"
                              />
                              <span className="text-gray-700 group-hover:text-primary-500 transition-colors">
                                Mascotas
                              </span>
                            </label>
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Horario
                              </label>
                              <select
                                className="input-field"
                                value={formData.schedule}
                                onChange={(e) =>
                                  setFormData({ ...formData, schedule: e.target.value })
                                }
                              >
                                <option value="diurno">Diurno</option>
                                <option value="nocturno">Nocturno</option>
                                <option value="flexible">Flexible</option>
                              </select>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg border border-gray-100">
                          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <CurrencyDollarIcon className="h-6 w-6 text-green-500" />
                            Presupuesto
                          </h3>
                          <div className="grid md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Mínimo (€)
                              </label>
                              <input
                                type="number"
                                className="input-field"
                                value={formData.budgetMin}
                                onChange={(e) =>
                                  setFormData({ ...formData, budgetMin: e.target.value })
                                }
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Máximo (€)
                              </label>
                              <input
                                type="number"
                                className="input-field"
                                value={formData.budgetMax}
                                onChange={(e) =>
                                  setFormData({ ...formData, budgetMax: e.target.value })
                                }
                              />
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg border border-gray-100">
                          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <HeartIcon className="h-6 w-6 text-pink-500" />
                            Estilo de vida
                          </h3>
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-3 h-3 rounded-full ${
                                  formData.smoker ? 'bg-yellow-500' : 'bg-green-500'
                                }`}
                              />
                              <span className="text-gray-700">
                                {formData.smoker ? 'Fuma' : 'No fuma'}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-3 h-3 rounded-full ${
                                  formData.pets ? 'bg-blue-500' : 'bg-gray-500'
                                }`}
                              />
                              <span className="text-gray-700">
                                {formData.pets ? 'Acepta mascotas' : 'Sin mascotas'}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-3 h-3 rounded-full bg-purple-500" />
                              <span className="text-gray-700 capitalize">
                                {formData.schedule}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg border border-gray-100">
                          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <CurrencyDollarIcon className="h-6 w-6 text-green-500" />
                            Presupuesto
                          </h3>
                          <div className="text-3xl font-bold gradient-text">
                            {formData.budgetMin || 0}€ - {formData.budgetMax || 0}€
                          </div>
                          <p className="text-gray-600 mt-2">Por mes</p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'achievements' && (
                  <motion.div
                    key="achievements"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="mt-8"
                  >
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {badges.map((badge, i) => (
                        <motion.div
                          key={badge.id}
                          initial={{ opacity: 0, scale: 0.8, rotateY: -90 }}
                          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                          transition={{ delay: i * 0.1, duration: 0.5 }}
                          whileHover={{ scale: 1.05, rotateY: 10 }}
                          className={`relative rounded-2xl p-6 shadow-lg overflow-hidden ${
                            badge.earned
                              ? 'bg-gradient-to-br from-white to-gray-50 border border-gray-200'
                              : 'bg-gray-100 opacity-50'
                          }`}
                        >
                          {badge.earned && (
                            <motion.div
                              animate={{
                                scale: [1, 1.5, 1],
                                opacity: [0.3, 0.6, 0.3],
                              }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className={`absolute inset-0 bg-gradient-to-br ${badge.color} opacity-10`}
                            />
                          )}
                          <div className="relative">
                            <motion.div
                              whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                              className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${badge.color} flex items-center justify-center mb-4 shadow-lg`}
                            >
                              <badge.icon className="h-8 w-8 text-white" />
                            </motion.div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">
                              {badge.label}
                            </h3>
                            <p className="text-sm text-gray-600">{badge.description}</p>
                            {badge.earned && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute top-2 right-2"
                              >
                                <CheckCircleIcon className="h-6 w-6 text-green-500" />
                              </motion.div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Profile
