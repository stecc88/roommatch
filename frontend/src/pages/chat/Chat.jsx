import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PaperAirplaneIcon,
  FaceSmileIcon,
  PhotoIcon,
  EllipsisVerticalIcon,
} from '@heroicons/react/24/solid'
import { CheckIcon, CheckBadgeIcon } from '@heroicons/react/24/solid'
import chatApi from '../../api/chat.api'
import matchesApi from '../../api/matches.api'
import { useAuth } from '../../contexts/AuthContext'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'

const TypingIndicator = () => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 10 }}
    className="flex gap-1 p-3 bg-gray-200 rounded-2xl w-fit"
  >
    {[0, 1, 2].map((i) => (
      <motion.div
        key={i}
        animate={{ y: [0, -5, 0] }}
        transition={{
          duration: 0.6,
          repeat: Infinity,
          delay: i * 0.1,
        }}
        className="w-2 h-2 bg-gray-500 rounded-full"
      />
    ))}
  </motion.div>
)

const Chat = () => {
  const { matchId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const qc = useQueryClient()
  const [message, setMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const { data: conversations } = useQuery('conversations', () => chatApi.getConversations())
  const { data: matches } = useQuery('matches', () => matchesApi.getMatches())

  const { data: messages, refetch } = useQuery(
    ['messages', matchId],
    () => chatApi.getMessages(matchId),
    { enabled: !!matchId, refetchInterval: 3000 }
  )

  const sendMessageMutation = useMutation(
    (data) => chatApi.sendMessage(data),
    {
      onSuccess: () => {
        setMessage('')
        refetch()
        qc.invalidateQueries('conversations')
        // Sonido de envío
        try {
          const ctx = new (window.AudioContext || window.webkitAudioContext)()
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.type = 'sine'
          osc.frequency.value = 800
          gain.gain.setValueAtTime(0.05, ctx.currentTime)
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.start()
          osc.stop(ctx.currentTime + 0.1)
        } catch {}
      },
    }
  )

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (message.trim() && conversations?.data) {
      const currentConv = conversations.data.find((c) => c.id === parseInt(matchId))
      if (currentConv) {
        sendMessageMutation.mutate({
          matchId,
          content: message,
          receiverId: currentConv.otherUser.id,
        })
      }
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (matchId) {
      chatApi
        .markAsRead(matchId)
        .then(() => {
          qc.invalidateQueries('conversations')
        })
        .catch(() => {})
    }
  }, [matchId, qc])

  // Simular typing indicator
  useEffect(() => {
    if (message.length > 0) {
      setIsTyping(true)
      const timer = setTimeout(() => setIsTyping(false), 1000)
      return () => clearTimeout(timer)
    } else {
      setIsTyping(false)
    }
  }, [message])

  const currentConversation = conversations?.data?.find(
    (c) => c.id === parseInt(matchId)
  )

  return (
    <div className="flex h-[calc(100vh-80px)] bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Lista de conversaciones */}
      <motion.div
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-96 bg-white border-r border-gray-200 overflow-hidden flex flex-col"
      >
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-secondary-50">
          <h2 className="text-2xl font-bold gradient-text">Messaggi</h2>
          <p className="text-sm text-gray-600 mt-1">
            {conversations?.data?.length || 0} conversaciones
          </p>
        </div>

        {/* Matches en carrusel */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-600 mb-3">I tuoi match</h3>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {matches?.data?.map((m) => (
              <motion.button
                key={m.id}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => navigate(`/chat/${m.id}`)}
                className={`flex-shrink-0 relative ${
                  String(matchId) === String(m.id) ? 'ring-4 ring-primary-300' : ''
                } rounded-full overflow-hidden transition-all`}
              >
                <img
                  src={
                    m.otherUser.avatar ||
                    `https://ui-avatars.com/api/?name=${m.otherUser.name}`
                  }
                  alt={m.otherUser.name}
                  className="w-16 h-16 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end justify-center pb-1">
                  <span className="text-white text-xs font-medium">
                    {m.otherUser.name.split(' ')[0]}
                  </span>
                </div>
                {/* Online indicator */}
                <div className="absolute bottom-1 right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
              </motion.button>
            ))}
          </div>
        </div>

        {/* Lista de conversaciones */}
        <div className="flex-1 overflow-y-auto">
          {[...(conversations?.data || [])]
            .sort((a, b) => {
              const at = a.lastMessage?.createdAt
                ? new Date(a.lastMessage.createdAt).getTime()
                : 0
              const bt = b.lastMessage?.createdAt
                ? new Date(b.lastMessage.createdAt).getTime()
                : 0
              return bt - at
            })
            .map((conv, index) => (
              <motion.div
                key={conv.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                onClick={() => navigate(`/chat/${conv.id}`)}
                className={`p-4 cursor-pointer border-b border-gray-100 transition-colors ${
                  String(matchId) === String(conv.id)
                    ? 'bg-gradient-to-r from-primary-50 to-secondary-50'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={
                        conv.otherUser.avatar ||
                        `https://ui-avatars.com/api/?name=${conv.otherUser.name}`
                      }
                      alt={conv.otherUser.name}
                      className="w-14 h-14 rounded-full object-cover"
                    />
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {conv.otherUser.name}
                      </h3>
                      {conv.lastMessage && (
                        <span className="text-xs text-gray-500">
                          {format(new Date(conv.lastMessage.createdAt), 'HH:mm', {
                            locale: it,
                          })}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600 truncate flex-1">
                        {conv.lastMessage?.content || 'Inizia la conversazione'}
                      </p>
                      {conv.unreadCount > 0 && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="ml-2 px-2 py-0.5 bg-primary-500 text-white text-xs rounded-full font-bold"
                        >
                          {conv.unreadCount}
                        </motion.span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
        </div>
      </motion.div>

      {/* Área de chat */}
      <div className="flex-1 flex flex-col bg-white">
        {matchId ? (
          <>
            {/* Header del chat */}
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="p-6 bg-gradient-to-r from-primary-500 to-secondary-500 text-white flex items-center justify-between shadow-lg"
            >
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={
                      currentConversation?.otherUser.avatar ||
                      `https://ui-avatars.com/api/?name=${currentConversation?.otherUser.name}`
                    }
                    alt={currentConversation?.otherUser.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-white"
                  />
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-primary-500" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">
                    {currentConversation?.otherUser.name}
                  </h2>
                  <p className="text-sm text-white/80">Online</p>
                </div>
              </div>
              <button className="p-2 hover:bg-white/20 rounded-full transition-colors">
                <EllipsisVerticalIcon className="h-6 w-6" />
              </button>
            </motion.div>

            {/* Mensajes */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50 to-white">
              <AnimatePresence>
                {messages?.data?.map((msg, index) => {
                  const isOwn = msg.senderId === user?.id
                  const prevMsg = messages.data[index - 1]
                  const showAvatar =
                    !prevMsg || prevMsg.senderId !== msg.senderId

                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 20, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      className={`flex gap-2 ${
                        isOwn ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {!isOwn && showAvatar && (
                        <img
                          src={
                            currentConversation?.otherUser.avatar ||
                            `https://ui-avatars.com/api/?name=${currentConversation?.otherUser.name}`
                          }
                          alt=""
                          className="w-8 h-8 rounded-full object-cover self-end"
                        />
                      )}
                      {!isOwn && !showAvatar && <div className="w-8" />}

                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className={`group relative max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-md ${
                          isOwn
                            ? 'bg-gradient-to-br from-primary-500 to-secondary-500 text-white rounded-br-sm'
                            : 'bg-white text-gray-900 rounded-bl-sm border border-gray-200'
                        }`}
                      >
                        <p className="break-words">{msg.content}</p>
                        <div
                          className={`flex items-center gap-1 text-xs mt-1 ${
                            isOwn ? 'text-white/70' : 'text-gray-500'
                          }`}
                        >
                          <span>
                            {format(new Date(msg.createdAt), 'HH:mm', {
                              locale: it,
                            })}
                          </span>
                          {isOwn && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                            >
                              {msg.read ? (
                                <CheckBadgeIcon className="w-4 h-4 text-blue-300" />
                              ) : (
                                <CheckIcon className="w-4 h-4" />
                              )}
                            </motion.div>
                          )}
                        </div>

                        {/* Tooltip con hora completa al hover */}
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                          {format(new Date(msg.createdAt), 'd MMMM, HH:mm', {
                            locale: it,
                          })}
                        </div>
                      </motion.div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>

              {/* Typing indicator */}
              <AnimatePresence>
                {isTyping && <TypingIndicator />}
              </AnimatePresence>

              <div ref={messagesEndRef} />
            </div>

            {/* Input de mensaje */}
            <motion.form
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              onSubmit={handleSendMessage}
              className="p-6 bg-white border-t border-gray-200 shadow-lg"
            >
              <div className="flex gap-3 items-end">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-3 text-gray-500 hover:text-primary-500 hover:bg-primary-50 rounded-full transition-colors"
                >
                  <PhotoIcon className="h-6 w-6" />
                </motion.button>

                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-3 text-gray-500 hover:text-primary-500 hover:bg-primary-50 rounded-full transition-colors"
                >
                  <FaceSmileIcon className="h-6 w-6" />
                </motion.button>

                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Scrivi un messaggio..."
                    className="w-full px-6 py-4 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={!message.trim() || sendMessageMutation.isLoading}
                  whileHover={{ scale: message.trim() ? 1.1 : 1 }}
                  whileTap={{ scale: message.trim() ? 0.9 : 1 }}
                  className={`p-4 rounded-full transition-all ${
                    message.trim()
                      ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg hover:shadow-xl'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <motion.div
                    animate={
                      sendMessageMutation.isLoading
                        ? { rotate: 360 }
                        : { rotate: 0 }
                    }
                    transition={{ duration: 0.5 }}
                  >
                    <PaperAirplaneIcon className="h-6 w-6" />
                  </motion.div>
                </motion.button>
              </div>
            </motion.form>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex items-center justify-center"
          >
            <div className="text-center p-12">
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-3xl flex items-center justify-center"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  💬
                </motion.div>
              </motion.div>
              <h2 className="text-3xl font-semibold gradient-text mb-3">
                Seleziona una conversazione
              </h2>
              <p className="text-gray-500 max-w-sm">
                Scegli un match per iniziare a chattare e conoscervi meglio
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default Chat
