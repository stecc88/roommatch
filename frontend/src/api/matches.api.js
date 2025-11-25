import axios from './axios.config'

const matchesApi = {
  like: (data) => axios.post('/matches/like', data), // data: { listingId, targetUserId }
  getMatches: () => axios.get('/matches'),
  getIncomingLikes: () => axios.get('/matches/incoming'),
  getOutgoingLikes: () => axios.get('/matches/outgoing'),
  getDiscoverUsers: (params) => axios.get('/discover', { params }),
  // unmatch: (matchId) => axios.delete(`/matches/${matchId}`), // Not implemented yet
}

export default matchesApi
