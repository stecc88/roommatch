import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import chatApi from '../../api/chat.api'
import matchesApi from '../../api/matches.api'

const Notifications = () => {
  const { data: conversations } = useQuery('conversations', () => chatApi.getConversations())
  const { data: matches } = useQuery('matches', () => matchesApi.getMatches())

  const lastSeenRaw = localStorage.getItem('notif.lastSeen')
  const lastSeen = lastSeenRaw ? parseInt(lastSeenRaw) : 0

  const unreadConvs = (conversations?.data || []).filter(c => (c.unreadCount || 0) > 0)
  const newMatches = (matches?.data || []).filter(m => {
    try { return new Date(m.createdAt).getTime() > lastSeen } catch { return false }
  })

  const markAllSeen = () => {
    const now = Date.now()
    localStorage.setItem('notif.lastSeen', String(now))
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Notifiche</h1>
            <button className="text-sm text-gray-600 hover:text-primary-600" onClick={markAllSeen}>Segna tutto come visto</button>
          </div>

          <div className="mb-6">
            <h2 className="text-sm font-semibold text-gray-600 mb-2">Messaggi non letti</h2>
            {unreadConvs.length === 0 ? (
              <p className="text-sm text-gray-500">Nessun nuovo messaggio</p>
            ) : (
              <div className="divide-y">
                {unreadConvs.map(c => (
                  <Link key={c.id} to={`/chat/${c.id}`} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
                    <img src={c.otherUser.avatar || `https://ui-avatars.com/api/?name=${c.otherUser.name}`} alt={c.otherUser.name} className="w-10 h-10 rounded-full" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{c.otherUser.name}</p>
                      <p className="text-xs text-gray-600 truncate">{c.lastMessage?.content || 'Nuovo messaggio'}</p>
                    </div>
                    <span className="px-2 py-1 bg-primary-100 text-primary-600 rounded-full text-xs">{c.unreadCount}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-sm font-semibold text-gray-600 mb-2">Nuovi match</h2>
            {newMatches.length === 0 ? (
              <p className="text-sm text-gray-500">Nessun nuovo match</p>
            ) : (
              <div className="divide-y">
                {newMatches.map(m => (
                  <Link key={m.id} to={`/chat/${m.id}`} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
                    <img src={m.otherUser.avatar || `https://ui-avatars.com/api/?name=${m.otherUser.name}`} alt={m.otherUser.name} className="w-10 h-10 rounded-full" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{m.otherUser.name}</p>
                      <p className="text-xs text-gray-600 truncate">Nuevo match</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Notifications