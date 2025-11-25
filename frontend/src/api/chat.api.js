import axios from './axios.config'
// API de chat: conversaciones, mensajes y lectura

const chatApi = {
  getConversations: () => axios.get('/chat/conversations'),
  getMessages: (matchId) => axios.get(`/chat/${matchId}`),
  sendMessage: (data) => axios.post('/chat', data), // data: { matchId, content, receiverId }
  markAsRead: (matchId) => axios.put(`/chat/${matchId}/read`),
  // markAsRead: (matchId) => axios.put(`/chat/${matchId}/read`), // Not implemented yet
}

export default chatApi
