import React from 'react'
import { useQuery, useMutation } from 'react-query'
import { motion } from 'framer-motion'
import { HeartIcon, ChatBubbleLeftIcon, UserPlusIcon, ArrowRightCircleIcon, MapPinIcon, CalendarDaysIcon, BanknotesIcon, AcademicCapIcon, BriefcaseIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'
import matchesApi from '../../api/matches.api'
import { useT } from '../../i18n/i18n.jsx'
import EmptyState from '../../components/common/EmptyState'
import toast from 'react-hot-toast'

const Matches = () => {
  const { data: matches, isLoading } = useQuery('matches', () => matchesApi.getMatches())
  const { data: incoming } = useQuery('incomingLikes', () => matchesApi.getIncomingLikes())
  const { data: outgoing } = useQuery('outgoingLikes', () => matchesApi.getOutgoingLikes())
  const { t } = useT()
  const tabs = [
    { key: 'matches', label: t('tabs.matches') },
    { key: 'incoming', label: t('tabs.incoming') },
    { key: 'outgoing', label: t('tabs.outgoing') },
  ]
  const [active, setActive] = React.useState('matches')
  const correspondMutation = useMutation(
    (userId) => matchesApi.like({ targetUserId: userId }),
    { onSuccess: (data) => { if (data.data?.match) toast.success('¡Es un match! 🎉') } }
  )

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary-500"></div>
      </div>
    )
  }

  if (!matches?.data?.length && active === 'matches') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <EmptyState
          icon={<HeartIcon className="h-16 w-16 text-gray-400" />}
          title="No tienes matches aún"
          description="Sigue explorando perfiles para encontrar tu match perfecto"
          action={
            <Link to="/discover" className="btn btn-primary">
              Explorar perfiles
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-4">Conexiones</h1>
        <div className="relative flex gap-2 mb-6">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setActive(t.key)} className={`relative px-4 py-2 rounded-full border ${active === t.key ? 'bg-primary-100 border-primary-300 text-primary-700' : 'bg-white border-gray-200 text-gray-700'}`}>
              {t.label}
              {active === t.key && (
                <motion.div layoutId="tab-underline" className="absolute -bottom-1 left-0 right-0 h-1 bg-primary-500 rounded-full" />
              )}
            </button>
          ))}
        </div>
        {active === 'matches' && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(matches?.data || []).map((m, idx) => (
              <motion.div key={m.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img src={m.otherUser.avatar || `https://ui-avatars.com/api/?name=${m.otherUser.name}&size=600`} alt={m.otherUser.name} className="w-full h-56 object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute inset-0 p-4 flex flex-col justify-between">
                  <div>
                    <div className="text-white font-bold text-xl">{m.otherUser.name}</div>
                    <div className="space-y-1 text-white/90 text-sm mt-1">
                      <div className="flex items-center gap-2"><MapPinIcon className="h-4 w-4" /><span>{m.otherUser.ciudadBusquedaPiso || '—'}</span></div>
                      <div className="flex items-center gap-2"><CalendarDaysIcon className="h-4 w-4" /><span>Match reciente</span></div>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Link to={`/chat/${m.id}`} className="w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center shadow-lg">
                      <ChatBubbleLeftIcon className="h-6 w-6 text-white" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        {active === 'incoming' && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(incoming?.data || []).map((like, idx) => (
              <motion.div key={like.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img src={like.user.avatar || `https://ui-avatars.com/api/?name=${like.user.name}&size=600`} alt={like.user.name} className="w-full h-56 object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute inset-0 p-4 flex flex-col justify-between">
                  <div>
                    <div className="text-white font-bold text-xl">{like.user.name}</div>
                    <div className="space-y-1 text-white/90 text-sm mt-1">
                      <div className="flex items-center gap-2"><MapPinIcon className="h-4 w-4" /><span>{like.user.ciudadBusquedaPiso || '—'}</span></div>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button onClick={() => correspondMutation.mutate(like.user.id)} className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center shadow-lg">
                      <UserPlusIcon className="h-6 w-6 text-white" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        {active === 'outgoing' && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(outgoing?.data || []).map((like, idx) => (
              <motion.div key={like.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img src={like.user.avatar || `https://ui-avatars.com/api/?name=${like.user.name}&size=600`} alt={like.user.name} className="w-full h-56 object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute inset-0 p-4 flex flex-col justify-between">
                  <div>
                    <div className="text-white font-bold text-xl">{like.user.name}</div>
                    <div className="space-y-1 text-white/90 text-sm mt-1">
                      <div className="flex items-center gap-2"><MapPinIcon className="h-4 w-4" /><span>{like.user.ciudadBusquedaPiso || '—'}</span></div>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center shadow-lg">
                      <ArrowRightCircleIcon className="h-6 w-6 text-gray-700" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Matches
