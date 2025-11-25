// src/pages/listings/CreateListing.jsx
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HomeIcon, CurrencyDollarIcon, MapPinIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import listingsApi from '../../api/listings.api'   // 👈 ARREGLADO

const CreateListing = () => {
    const { register, handleSubmit, formState: { errors } } = useForm()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)

    const [images, setImages] = useState([])

    const onSubmit = async (data) => {
        setLoading(true)
        try {
            const formData = new FormData()
            formData.append('title', data.title)
            formData.append('description', data.description)
            formData.append('price', String(parseFloat(data.price)))
            formData.append('location', data.location)
            if (data.amenities) formData.append('amenities', data.amenities)
            if (data.rules) formData.append('rules', data.rules)
            if (data.availableFrom) formData.append('availableFrom', data.availableFrom)
            if (data.roomType) formData.append('roomType', data.roomType)
            images.forEach(file => formData.append('images', file))

            await listingsApi.createListing(formData)
            toast.success('¡Anuncio creado con éxito!')
            navigate('/rooms')
        } catch (error) {
            console.error(error)
            toast.error('Error al crear el anuncio')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-2xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-xl p-8"
                >
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-primary-500 to-secondary-500 text-white mb-3">
                            <HomeIcon className="h-8 w-8" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">Publicar Anuncio</h1>
                        <p className="text-gray-600 mt-2">Cuéntanos sobre el espacio que ofreces</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Título */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Título del Anuncio
                            </label>
                            <div className="relative">
                                <HomeIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    className="input-field pl-10"
                                    placeholder="Ej: Habitación luminosa en el centro"
                                    {...register('title', { required: 'El título es requerido' })}
                                />
                            </div>
                            {errors.title && (
                                <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                            )}
                        </div>

                        {/* Descripción */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Descripción
                            </label>
                            <textarea
                                rows="4"
                                className="input-field"
                                placeholder="Describe la habitación, el piso y los compañeros..."
                                {...register('description', { required: 'La descripción es requerida' })}
                            />
                            {errors.description && (
                                <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                            )}
                        </div>

                        {/* Precio + Ubicación */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Precio Mensual (€)
                                </label>
                                <div className="relative">
                                    <CurrencyDollarIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                    <input
                                        type="number"
                                        className="input-field pl-10"
                                        placeholder="450"
                                        {...register('price', {
                                            required: 'El precio es requerido',
                                            min: 0
                                        })}
                                    />
                                </div>
                                {errors.price && (
                                    <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Ubicación
                                </label>
                                <div className="relative">
                                    <MapPinIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                    <input
                                        type="text"
                                        className="input-field pl-10"
                                        placeholder="Ciudad, Barrio"
                                        {...register('location', {
                                            required: 'La ubicación es requerida'
                                        })}
                                    />
                                </div>
                                {errors.location && (
                                    <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>
                                )}
                            </div>
                        </div>

                        {/* Comodidades */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Comodidades (separadas por comas)
                            </label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="Wifi, Ascensor, Baño privado..."
                                {...register('amenities')}
                            />
                        </div>

                        {/* Reglas de la casa */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Reglas de la casa (separadas por comas)
                            </label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="No fumar, No mascotas, Limpieza..."
                                {...register('rules')}
                            />
                        </div>

                        {/* Disponibilidad y Tipo */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Fecha de disponibilidad
                                </label>
                                <input
                                    type="date"
                                    className="input-field"
                                    {...register('availableFrom')}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tipo de habitación
                                </label>
                                <select className="input-field" {...register('roomType')}>
                                    <option value="">Selecciona tipo</option>
                                    <option value="SINGLE">Single</option>
                                    <option value="DOUBLE">Doble</option>
                                    <option value="SUITE">Suite</option>
                                </select>
                            </div>
                        </div>

                        {/* Imágenes */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Imágenes (hasta 6)</label>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) => {
                                    const files = Array.from(e.target.files || []).slice(0, 6)
                                    setImages(files)
                                }}
                            />
                            {images.length > 0 && (
                                <div className="grid grid-cols-3 gap-3 mt-3">
                                    {images.map((file, idx) => (
                                        <img key={idx} src={URL.createObjectURL(file)} alt="preview" className="w-full h-24 object-cover rounded-lg" />
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-sm text-gray-600">
                            Consejo: añade entre 3 y 6 comodidades clave para destacar tu anuncio.
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn btn-primary py-3 text-lg"
                        >
                            {loading ? 'Publicando...' : 'Publicar Anuncio'}
                        </button>
                    </form>
                </motion.div>
            </div>
        </div>
    )
}

export default CreateListing
