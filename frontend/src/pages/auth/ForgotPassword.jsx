import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { EnvelopeIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import authApi from '../../api/auth.api'

const ForgotPassword = () => {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const onSubmit = async ({ email }) => {
    setLoading(true)
    try {
      const res = await authApi.forgotPassword(email)
      if (res.data.resetToken) {
        navigate(`/reset-password?token=${encodeURIComponent(res.data.resetToken)}`)
      } else {
        toast.success('Si el email existe, se enviará un enlace')
      }
    } catch (e) {
      toast.error('Error al solicitar recuperación')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">Recuperar contraseña</h1>
          <p className="text-gray-600">Ingresa tu email para recibir instrucciones</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <div className="relative">
              <EnvelopeIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input type="email" className="input-field pl-10" placeholder="tu@email.com" {...register('email', { required: 'El email es requerido' })} />
            </div>
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>
          <button type="submit" disabled={loading} className="w-full btn btn-primary">
            {loading ? 'Enviando...' : 'Enviar instrucciones'}
          </button>
        </form>
      </motion.div>
    </div>
  )
}

export default ForgotPassword
