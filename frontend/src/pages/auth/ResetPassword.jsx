import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LockClosedIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import authApi from '../../api/auth.api'

const ResetPassword = () => {
  const [searchParams] = useSearchParams()
  const initialToken = searchParams.get('token') || ''
  const { register, handleSubmit, watch, formState: { errors } } = useForm({ defaultValues: { token: initialToken } })
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const password = watch('password')

  const onSubmit = async ({ token, password }) => {
    setLoading(true)
    try {
      await authApi.resetPassword({ token, password })
      toast.success('Contraseña actualizada')
      navigate('/login', { state: { resetSuccess: true } })
    } catch (e) {
      toast.error('Token inválido o expirado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-500 to-primary-500 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">Restablecer contraseña</h1>
          <p className="text-gray-600">Introduce el token y tu nueva contraseña</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Token</label>
            <input type="text" className="input-field" placeholder="Pega el token recibido" {...register('token', { required: 'El token es requerido' })} />
            {errors.token && <p className="text-red-500 text-sm mt-1">{errors.token.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nueva contraseña</label>
            <div className="relative">
              <LockClosedIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input type="password" className="input-field pl-10" placeholder="••••••••" {...register('password', { required: 'La contraseña es requerida', minLength: { value: 8, message: 'Mínimo 8 caracteres' } })} />
            </div>
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar contraseña</label>
            <div className="relative">
              <LockClosedIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input type="password" className="input-field pl-10" placeholder="••••••••" {...register('confirmPassword', { required: 'Confirma tu contraseña', validate: v => v === password || 'Las contraseñas no coinciden' })} />
            </div>
            {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>}
          </div>
          <button type="submit" disabled={loading} className="w-full btn btn-primary">
            {loading ? 'Actualizando...' : 'Actualizar contraseña'}
          </button>
        </form>
      </motion.div>
    </div>
  )
}

export default ResetPassword
