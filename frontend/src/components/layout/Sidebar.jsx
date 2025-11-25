import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery } from 'react-query'
import chatApi from '../../api/chat.api'
import authApi from '../../api/auth.api'
import { useAuth } from '../../contexts/AuthContext'
import { UserCircleIcon, HomeModernIcon, HeartIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline'
import { useT } from '../../i18n/i18n.jsx'

const Sidebar = () => {
  const location = useLocation()
  const { t } = useT()
  const items = [
    { path: '/discover', label: t('sidebar.discover'), icon: HeartIcon },
    { path: '/matches', label: t('sidebar.match'), icon: HeartIcon },
    { path: '/profile', label: t('sidebar.profile'), icon: UserCircleIcon },
    { path: '/my-listings', label: t('sidebar.myListings'), icon: HomeModernIcon },
    { path: '/chat', label: t('sidebar.messages'), icon: ChatBubbleLeftRightIcon },
  ]

  const { user } = useAuth()
  const { data: conversations } = useQuery('conversations', () => chatApi.getConversations(), { enabled: !!user })
  const unreadTotal = (conversations?.data || []).reduce((sum, c) => sum + (c.unreadCount || 0), 0)
  const { data: profile } = useQuery('sidebarProfile', () => authApi.getProfile(), { enabled: !!user })
  const listingsCount = profile?.data?.listings?.length || 0

  return (
    <aside className="hidden md:block md:col-span-3 lg:col-span-2">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-white/90 backdrop-blur rounded-2xl shadow-2xl p-4 sticky top-24 overflow-hidden"
      >
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-gradient-to-br from-primary-200 to-secondary-200 opacity-40 blur-2xl rounded-full animate-blob" />
        <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-gradient-to-br from-secondary-200 to-primary-200 opacity-30 blur-2xl rounded-full animate-blob" />

        <div className="space-y-1 relative">
          {items.map(({ path, label, icon: Icon }) => {
            const active = location.pathname === path
            return (
              <motion.div key={path} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="relative">
                {active && (
                  <motion.div layoutId="sidebar-active" className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500 rounded-r-full" />
                )}
                <Link
                  to={path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition relative ${
                    active
                      ? 'bg-gradient-to-r from-primary-50 to-secondary-50 text-primary-700'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <motion.span animate={{ scale: active ? 1.05 : 1 }} transition={{ type: 'spring', stiffness: 260, damping: 20 }}>
                    <Icon className="h-5 w-5" />
                  </motion.span>
                  <span className="font-medium">{label}</span>
                  {label === 'Mensajes' && unreadTotal > 0 && (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-auto px-2 py-0.5 text-xs rounded-full bg-primary-500 text-white font-bold">
                      {unreadTotal}
                    </motion.span>
                  )}
                  {label === 'Mis anuncios' && listingsCount > 0 && (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-auto px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700">
                      {listingsCount}
                    </motion.span>
                  )}
                  {active && (
                    <motion.span
                      layoutId={`sidebar-pill-${path}`}
                      className="ml-auto px-2 py-0.5 text-xs rounded-full bg-primary-100 text-primary-700"
                    >
                      Activo
                    </motion.span>
                  )}
                </Link>
              </motion.div>
            )
          })}
        </div>
      </motion.div>
    </aside>
  )
}

export default Sidebar
