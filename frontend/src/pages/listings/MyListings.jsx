import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { motion } from 'framer-motion'
import { MapPinIcon, CurrencyDollarIcon, PencilSquareIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import { useAuth } from '../../contexts/AuthContext'
import listingsApi from '../../api/listings.api'
import matchesApi from '../../api/matches.api'
import { Link } from 'react-router-dom'

const EditModal = ({ open, onClose, listing, onSave }) => {
  const [form, setForm] = useState(() => ({
    title: listing?.title || '',
    description: listing?.description || '',
    price: listing?.price || '',
    location: listing?.location || '',
    amenities: (listing?.amenities || []).join(', '),
    coverFile: null,
  }))

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Modifica annuncio</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titolo</label>
            <input className="input-field" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrizione</label>
            <textarea rows="4" className="input-field" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prezzo (€)</label>
              <input type="number" className="input-field" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Posizione</label>
              <input className="input-field" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Servizi (virgola)</label>
            <input className="input-field" value={form.amenities} onChange={(e) => setForm({ ...form, amenities: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Immagine di copertina</label>
            <input type="file" accept="image/*" onChange={(e) => setForm({ ...form, coverFile: e.target.files?.[0] || null })} />
            {(form.coverFile || listing?.images?.[0]) && (
              <img src={form.coverFile ? URL.createObjectURL(form.coverFile) : listing.images[0]} alt="cover" className="w-full h-32 object-cover rounded-lg mt-2" />
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button className="btn bg-gray-200 text-gray-700" onClick={onClose}>Annulla</button>
          <button className="btn btn-primary" onClick={() => onSave(form)}>Salva</button>
        </div>
      </div>
    </div>
  )
}

const MyListings = () => {
  const { user } = useAuth()
  const qc = useQueryClient()
  const { data, isLoading, isError } = useQuery(['listings'], () => listingsApi.getListings())
  const { data: matchesData } = useQuery(['matches'], () => matchesApi.getMatches())
  const [editingListing, setEditingListing] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)

  const updateMutation = useMutation(({ id, payload }) => listingsApi.updateListing(id, payload), {
    onSuccess: () => {
      toast.success('Annuncio aggiornato')
      qc.invalidateQueries(['listings'])
      setModalOpen(false)
      setEditingListing(null)
    },
    onError: () => toast.error('Errore nell\'aggiornamento')
  })

  const deleteMutation = useMutation((id) => listingsApi.deleteListing(id), {
    onSuccess: () => {
      toast.success('Annuncio eliminato')
      qc.invalidateQueries(['listings'])
    },
    onError: () => toast.error('Errore nell\'eliminazione')
  })

  const myListings = useMemo(() => data?.data?.filter(l => l.ownerId === user?.id) || [], [data, user])

  const handleEdit = (listing) => {
    setEditingListing(listing)
    setModalOpen(true)
  }

  const handleSave = (form) => {
    const amenities = form.amenities ? form.amenities.split(',').map(a => a.trim()).filter(Boolean) : []
    const payload = new FormData()
    payload.append('title', form.title)
    payload.append('description', form.description)
    payload.append('price', String(Number(form.price)))
    payload.append('location', form.location)
    if (amenities.length) payload.append('amenities', amenities.join(', '))
    if (form.coverFile) payload.append('images', form.coverFile)
    updateMutation.mutate({ id: editingListing.id, payload })
  }

  const handleDelete = (id) => {
    if (confirm('¿Seguro que quieres eliminar este anuncio?')) {
      deleteMutation.mutate(id)
    }
  }

  const matchesByListing = useMemo(() => {
    const list = matchesData?.data || []
    const map = new Map()
    list.forEach(m => {
      if (m.listingId) {
        map.set(m.listingId, (map.get(m.listingId) || 0) + 1)
      }
    })
    return map
  }, [matchesData])

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary-500"></div>
      </div>
    )
  }

  if (isError) {
    return <p className="text-center mt-20">Errore nel caricamento dei tuoi annunci</p>
  }

  return (
    <div className="min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">I miei annunci</h1>
        <Link to="/rooms/new" className="btn btn-primary flex items-center gap-2">
          <PlusIcon className="h-5 w-5" />
          Nuovo annuncio
        </Link>
      </div>

      {myListings.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <p className="text-gray-600 mb-4">Non hai ancora annunci pubblicati.</p>
          <Link to="/rooms/new" className="btn btn-primary">Pubblica annuncio</Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myListings.map((room, index) => (
            <motion.div key={room.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="relative h-40">
                <img src={room.images?.[0] || `https://ui-avatars.com/api/?name=${room.title}&size=300`} alt={room.title} className="w-full h-full object-cover" />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-sm flex items-center gap-2">
                  <CurrencyDollarIcon className="h-4 w-4" />
                  <span className="font-semibold">{room.price} €</span>/mes
                </div>
                <div className="absolute top-3 right-3 bg-primary-500 text-white px-3 py-1 rounded-full text-sm">
                  {matchesByListing.get(room.id) || 0} matches
                </div>
              </div>
              <h2 className="text-xl font-semibold mb-2">{room.title}</h2>
              <div className="flex items-center text-gray-600 mb-1">
                <MapPinIcon className="h-5 w-5 mr-1" />
                {room.location}
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {(room.amenities || []).slice(0, 6).map((a, i) => (
                  <span key={i} className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-700">{a}</span>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(room)} className="flex-1 btn bg-gray-100 text-gray-800 flex items-center justify-center gap-2">
                  <PencilSquareIcon className="h-5 w-5" /> Modifica
                </button>
                <button onClick={() => handleDelete(room.id)} className="btn bg-red-500 text-white flex items-center justify-center gap-2">
                  <TrashIcon className="h-5 w-5" /> Elimina
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <EditModal open={modalOpen} onClose={() => setModalOpen(false)} listing={editingListing} onSave={(form) => handleSave(form)} />
    </div>
  )
}

export default MyListings
