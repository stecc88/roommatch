import { useEffect } from 'react'
import { io } from 'socket.io-client'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'
import { useQueryClient } from 'react-query'

const useSocket = () => {
    const { user } = useAuth()
    const qc = useQueryClient()

    useEffect(() => {
        if (!user) return

        const base = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || window.location.origin
        let socket = io(base, {
            path: '/socket.io',
            transports: ['websocket', 'polling'],
            withCredentials: true,
        })

        const ensurePermission = async () => {
            try {
                if (!('Notification' in window)) return false
                if (Notification.permission === 'granted') return true
                const res = await Notification.requestPermission()
                return res === 'granted'
            } catch { return false }
        }

        const notify = async (title, body) => {
            const ok = await ensurePermission()
            if (!ok) return
            try {
                new Notification(title, { body })
            } catch {}
        }

        const playBeep = (freq = 1000, duration = 120) => {
            try {
                const ctx = new (window.AudioContext || window.webkitAudioContext)()
                const osc = ctx.createOscillator()
                const gain = ctx.createGain()
                osc.type = 'sine'
                osc.frequency.value = freq
                gain.gain.setValueAtTime(0.03, ctx.currentTime)
                osc.connect(gain)
                gain.connect(ctx.destination)
                osc.start()
                osc.stop(ctx.currentTime + duration / 1000)
            } catch {}
        }

        socket.on('connect', () => {
            console.log('Connected to socket server')
            socket.emit('join', user.id)
        })

        socket.on('new_match', (data) => {
            const name = typeof data.withUser === 'object' ? data.withUser.name : data.withUser
            toast.success(`¡Nuevo Match con ${name}! 🎉`, {
                duration: 5000,
                position: 'top-right'
            })
            playBeep(1200, 160)
            notify('Nuevo match', `Has hecho match con ${name}`)
        })

        socket.on('new_message', (data) => {
            const inChat = window.location.pathname.includes(`/chat/${data.matchId}`)
            toast(`Nuevo mensaje de ${data.senderName}: ${data.content}`, {
                icon: '💬',
                duration: 3500,
                position: 'top-right'
            })
            playBeep(900, 140)
            if (!inChat) {
                notify('Nuevo mensaje', `${data.senderName}: ${data.content}`)
            }
            if (!inChat) {
                qc.invalidateQueries('conversations')
            } else {
                qc.invalidateQueries(['messages', data.matchId])
            }
        })

        socket.on('connect_error', (err) => {
            try {
                const fallback = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || 'http://localhost:3001'
                socket.disconnect()
                socket = io(fallback, {
                    path: '/socket.io',
                    transports: ['websocket', 'polling'],
                    withCredentials: true,
                })
            } catch {}
        })

        return () => {
            socket.disconnect()
        }
    }, [user])
}

export default useSocket
