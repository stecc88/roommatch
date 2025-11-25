import axios from './axios.config'

const listingsApi = {
    getListings: (params) => axios.get('/listings', { params }),
    getListing: (id) => axios.get(`/listings/${id}`),
    createListing: (data) => {
        const isForm = typeof FormData !== 'undefined' && data instanceof FormData
        return axios.post('/listings', data, isForm ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined)
    },
    updateListing: (id, data) => {
        const isForm = typeof FormData !== 'undefined' && data instanceof FormData
        return axios.put(`/listings/${id}`, data, isForm ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined)
    },
    deleteListing: (id) => axios.delete(`/listings/${id}`),
    toggleFavorite: (id) => axios.post(`/listings/${id}/favorite`),
    getFavoriteListings: () => axios.get('/listings/favorites'),
}

export default listingsApi
