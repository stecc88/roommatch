import { motion, useScroll, useTransform } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  HeartIcon,
  HomeModernIcon,
  ChatBubbleLeftRightIcon,
  SparklesIcon,
  ShieldCheckIcon,
  BoltIcon,
  UserGroupIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline'
import { useAuth } from '../../contexts/AuthContext'
import { useT } from '../../i18n/i18n.jsx'

const Home = () => {
  const { user } = useAuth()
  const { t } = useT()
  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 1], [0, -50])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  const features = [
    {
      icon: <HeartIcon className="h-8 w-8" />,
      title: t('home.features.match.title'),
      description: t('home.features.match.description'),
      color: 'from-pink-500 to-red-500',
      delay: 0,
    },
    {
      icon: <HomeModernIcon className="h-8 w-8" />,
      title: t('home.features.rooms.title'),
      description: t('home.features.rooms.description'),
      color: 'from-blue-500 to-cyan-500',
      delay: 0.1,
    },
    {
      icon: <ChatBubbleLeftRightIcon className="h-8 w-8" />,
      title: t('home.features.chat.title'),
      description: t('home.features.chat.description'),
      color: 'from-purple-500 to-pink-500',
      delay: 0.2,
    },
    {
      icon: <SparklesIcon className="h-8 w-8" />,
      title: t('home.features.verified.title'),
      description: t('home.features.verified.description'),
      color: 'from-yellow-500 to-orange-500',
      delay: 0.3,
    },
  ]

  const benefits = [
    {
      icon: <ShieldCheckIcon className="h-6 w-6" />,
      title: t('home.benefits.secure.title'),
      description: t('home.benefits.secure.description'),
    },
    {
      icon: <BoltIcon className="h-6 w-6" />,
      title: t('home.benefits.fast.title'),
      description: t('home.benefits.fast.description'),
    },
    {
      icon: <UserGroupIcon className="h-6 w-6" />,
      title: t('home.benefits.community.title'),
      description: t('home.benefits.community.description'),
    },
    {
      icon: <TrophyIcon className="h-6 w-6" />,
      title: t('home.benefits.quality.title'),
      description: t('home.benefits.quality.description'),
    },
  ]

  const stats = [
    { value: '10K+', label: t('home.stats.activeUsers') },
    { value: '5K+', label: t('home.stats.successMatches') },
    { value: '3K+', label: t('home.stats.rooms') },
    { value: '95%', label: t('home.stats.satisfaction') },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50 to-purple-50 overflow-hidden">
      {/* Hero Section con parallax */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Efectos de fondo animados */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0, 0.6, 0],
                scale: [0, 2, 0],
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
              }}
              transition={{
                duration: 4 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 5,
              }}
              className={`absolute w-32 h-32 rounded-full blur-3xl ${
                i % 4 === 0
                  ? 'bg-primary-300/30'
                  : i % 4 === 1
                  ? 'bg-secondary-300/30'
                  : i % 4 === 2
                  ? 'bg-purple-300/30'
                  : 'bg-pink-300/30'
              }`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div style={{ y, opacity }} className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 1, bounce: 0.5 }}
              className="inline-block mb-8"
            >
              <div className="w-32 h-32 mx-auto rounded-3xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-2xl">
                <motion.div
                  animate={{
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                >
                  <SparklesIcon className="h-16 w-16 text-white" />
                </motion.div>
              </div>
            </motion.div>

          <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-6xl md:text-7xl font-bold mb-6"
            >
              <span className="gradient-text">{t('home.hero.title')} </span>
              <motion.span
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3,
                }}
                className="inline-block"
              >
                👋
              </motion.span>
            </motion.h1>

          <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl text-gray-700 mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              {t('home.hero.tagline.before')}{' '}
              <span className="font-bold gradient-text">{t('home.hero.tagline.emphasis')}</span>
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap gap-4 justify-center"
            >
              <Link to="/login">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}
                  whileTap={{ scale: 0.95 }}
                  className="px-10 py-5 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-2xl text-lg font-bold shadow-2xl"
                >
                  {t('home.hero.cta.search')}
                </motion.button>
              </Link>
              <Link to="/login">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-10 py-5 bg-white text-gray-800 rounded-2xl text-lg font-bold shadow-xl hover:shadow-2xl transition-all"
                >
                  {t('home.hero.cta.viewRooms')}
                </motion.button>
              </Link>
            </motion.div>

            {/* Scroll indicator */}
            <motion.div
              animate={{
                y: [0, 10, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
              }}
              className="mt-20"
            >
              <div className="w-6 h-10 border-2 border-gray-400 rounded-full mx-auto relative">
                <motion.div
                  animate={{
                    y: [0, 12, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                  }}
                  className="w-1.5 h-1.5 bg-gray-400 rounded-full absolute left-1/2 -translate-x-1/2 top-2"
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold gradient-text mb-4">
            {t('home.features.title')}
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('home.features.subtitle')}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: feature.delay, duration: 0.5 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="group bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all relative overflow-hidden"
            >
              {/* Efecto de brillo en hover */}
              <motion.div
                className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity`}
              />

              <motion.div
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
                className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center text-white mb-6 shadow-lg relative`}
              >
                {feature.icon}
              </motion.div>

              <h3 className="text-xl font-bold mb-3 text-gray-900">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Benefits bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 text-center shadow-lg"
            >
              <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-xl flex items-center justify-center text-primary-600">
                {benefit.icon}
              </div>
              <h4 className="font-bold text-gray-900 mb-1">{benefit.title}</h4>
              <p className="text-sm text-gray-600">{benefit.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-primary-500 via-secondary-500 to-purple-500 rounded-3xl shadow-2xl p-12 relative overflow-hidden"
        >
          {/* Efectos de fondo */}
          <div className="absolute inset-0">
            {[...Array(10)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  scale: [1, 2, 1],
                  opacity: [0.3, 0.6, 0.3],
                  x: Math.random() * 100 - 50,
                  y: Math.random() * 100 - 50,
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
                className="absolute w-20 h-20 bg-white/20 rounded-full blur-xl"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
              />
            ))}
          </div>

          <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.1 }}
                className="relative"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: index * 0.2,
                  }}
                  className="text-5xl font-bold text-white mb-2"
                >
                  {stat.value}
                </motion.div>
                <div className="text-white/90 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center bg-white/80 backdrop-blur-xl rounded-3xl p-16 shadow-2xl relative overflow-hidden"
        >
          <motion.div
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary-300/30 to-secondary-300/30 rounded-full blur-3xl"
          />

          <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-6 relative">
            {t('home.cta.title')}
          </h2>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto relative">
            {t('home.cta.subtitle')}
          </p>
          <Link to="/login">
            <motion.button
              whileHover={{
                scale: 1.05,
                boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
              }}
              whileTap={{ scale: 0.95 }}
              className="relative px-12 py-6 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-2xl text-xl font-bold shadow-2xl"
            >
              <motion.span
                animate={{
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
                className="absolute inset-0 bg-white/20 rounded-2xl"
              />
              <span className="relative">{t('home.cta.button')}</span>
            </motion.button>
          </Link>
        </motion.div>
      </section>
    </div>
  )
}

export default Home
