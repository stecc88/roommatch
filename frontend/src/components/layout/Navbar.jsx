import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BellIcon, ArrowRightOnRectangleIcon, UserCircleIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../../contexts/AuthContext'
import { useT } from '../../i18n/i18n.jsx'
import { useState, useRef, useEffect } from 'react'
import { useQuery } from 'react-query'
import chatApi from '../../api/chat.api'
import matchesApi from '../../api/matches.api'

const Navbar = () => {
  const location = useLocation()
  const { user, logout } = useAuth()
  const { locale, setLocale } = useT()
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef(null)

  const { data: conversations } = useQuery('conversations', () => chatApi.getConversations(), { enabled: !!user })
  const { data: matches } = useQuery('matches', () => matchesApi.getMatches(), { enabled: !!user })

  const unreadTotal = (conversations?.data || []).reduce((sum, c) => sum + (c.unreadCount || 0), 0)

  const [lastSeen, setLastSeen] = useState(() => {
    const v = localStorage.getItem('notif.lastSeen')
    return v ? parseInt(v) : 0
  })
  const newMatchesCount = (matches?.data || []).filter(m => {
    try {
      const ts = new Date(m.createdAt).getTime()
      return ts > lastSeen
    } catch { return false }
  }).length
  const bellCount = unreadTotal + newMatchesCount

  useEffect(() => {
    const handler = (e) => {
      if (!dropdownRef.current) return
      if (!dropdownRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [])

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50 hidden md:block">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-3 items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500" />
              <span className="text-xl font-bold gradient-text">RoomMatch</span>
            </Link>
          </div>

          <div className="flex items-center justify-center">
            <div className="relative" ref={dropdownRef}>
              <motion.button onClick={() => setOpen((v) => !v)} className="relative text-gray-600 hover:text-primary-500" animate={{ scale: bellCount > 0 ? 1.05 : 1 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                <BellIcon className="h-6 w-6" />
                {bellCount > 0 && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 15 }} className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">{bellCount}</motion.span>
                )}
              </motion.button>
              {open && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50">
                  <div className="p-3 border-b">
                    <h4 className="font-semibold">Notifiche</h4>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    <div className="p-3">
                      <h5 className="text-xs font-semibold text-gray-600 mb-2">Messaggi non letti</h5>
                      {(conversations?.data || []).filter(c => (c.unreadCount || 0) > 0).length === 0 ? (
                        <p className="text-sm text-gray-500">Nessun nuovo messaggio</p>
                      ) : (
                        (conversations?.data || []).filter(c => (c.unreadCount || 0) > 0).map(c => (
                          <Link key={c.id} to={`/chat/${c.id}`} onClick={() => setOpen(false)} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                            <img src={c.otherUser.avatar || `https://ui-avatars.com/api/?name=${c.otherUser.name}`} alt={c.otherUser.name} className="w-8 h-8 rounded-full" />
                            <div className="flex-1">
                              <p className="text-sm font-medium">{c.otherUser.name}</p>
                              <p className="text-xs text-gray-600 truncate">{c.lastMessage?.content || 'Nuovo messaggio'}</p>
                            </div>
                            <span className="px-2 py-1 bg-primary-100 text-primary-600 rounded-full text-xs">{c.unreadCount}</span>
                          </Link>
                        ))
                      )}
                    </div>
                    <div className="p-3 border-t">
                      <h5 className="text-xs font-semibold text-gray-600 mb-2">Nuovi match</h5>
                      {newMatchesCount === 0 ? (
                        <p className="text-sm text-gray-500">Nessun nuovo match</p>
                      ) : (
                        (matches?.data || []).filter(m => {
                          try { return new Date(m.createdAt).getTime() > lastSeen } catch { return false }
                        }).slice(0, 5).map(m => (
                          <Link key={m.id} to={`/chat/${m.id}`} onClick={() => setOpen(false)} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                            <img src={m.otherUser.avatar || `https://ui-avatars.com/api/?name=${m.otherUser.name}`} alt={m.otherUser.name} className="w-8 h-8 rounded-full" />
                            <div className="flex-1">
                              <p className="text-sm font-medium">{m.otherUser.name}</p>
                              <p className="text-xs text-gray-600 truncate">Nuovo match</p>
                            </div>
                          </Link>
                        ))
                      )}
                    </div>
                  </div>
                  <div className="p-3 border-t flex justify-between">
                    <Link to="/notifications" className="text-xs text-primary-600 hover:underline" onClick={() => setOpen(false)}>Vedi tutto</Link>
                    <button
                      className="text-xs text-gray-600 hover:text-primary-600"
                      onClick={() => { const now = Date.now(); localStorage.setItem('notif.lastSeen', String(now)); setLastSeen(now); setOpen(false) }}
                    >
                      Segna tutto come visto
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end space-x-4">
            <select
              value={locale}
              onChange={(e) => setLocale(e.target.value)}
              className="px-2 py-1 bg-gray-100 rounded-lg text-sm text-gray-700 hover:bg-gray-200"
            >
              <option value="it">IT</option>
              <option value="es">ES</option>
            </select>
            <Link to="/profile" className="flex items-center space-x-2 hover:text-primary-500">
              <UserCircleIcon className="h-6 w-6" />
              <span>{user?.name || 'Profilo'}</span>
            </Link>
            <button onClick={logout} className="flex items-center gap-1 text-gray-500 hover:text-red-500">
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
              <span>Esci</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
