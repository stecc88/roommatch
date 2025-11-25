import { Link, useLocation } from 'react-router-dom'
import { HomeIcon, HeartIcon, ChatBubbleLeftIcon, HomeModernIcon, UserIcon } from '@heroicons/react/24/outline'
import { HomeIcon as HomeIconSolid, HeartIcon as HeartIconSolid, ChatBubbleLeftIcon as ChatIconSolid, HomeModernIcon as RoomIconSolid, UserIcon as UserIconSolid } from '@heroicons/react/24/solid'

const MobileNav = () => {
  const location = useLocation()
  const { locale, setLocale } = useT()

  const navItems = [
    { path: '/', icon: HomeIcon, iconActive: HomeIconSolid, label: 'Home' },
    { path: '/discover', icon: HeartIcon, iconActive: HeartIconSolid, label: 'Esplora' },
    { path: '/chat', icon: ChatBubbleLeftIcon, iconActive: ChatIconSolid, label: 'Messaggi' },
    { path: '/rooms', icon: HomeModernIcon, iconActive: RoomIconSolid, label: 'Camere' },
    { path: '/profile', icon: UserIcon, iconActive: UserIconSolid, label: 'Profilo' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          const Icon = isActive ? item.iconActive : item.icon
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 h-full ${
                isActive ? 'text-primary-500' : 'text-gray-500'
              }`}
            >
              <Icon className="h-6 w-6" />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          )
        })}
        <div className="absolute right-2 bottom-2">
          <select
            value={locale}
            onChange={(e) => setLocale(e.target.value)}
            className="px-2 py-1 bg-gray-100 rounded-lg text-xs text-gray-700"
          >
            <option value="it">IT</option>
            <option value="es">ES</option>
          </select>
        </div>
      </div>
    </nav>
  )
}

export default MobileNav
import { useT } from '../../i18n/i18n.jsx'
