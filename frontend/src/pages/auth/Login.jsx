import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../../contexts/AuthContext'
// Pantalla de login: autentica y guarda token

const Login = () => {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm()
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)

  const onSubmit = async (data) => {
    setLoading(true)
    await login(data.email, data.password)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">Bentornato</h1>
          <p className="text-gray-600">Accedi per trovare il tuo match perfetto</p>
        </div>

        {location.state?.resetSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 rounded-xl p-4">
            La tua password è stata aggiornata. Ora puoi accedere.
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <div className="relative">
              <EnvelopeIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="email"
                className="input-field pl-10"
                placeholder="tu@email.com"
                {...register('email', {
                  required: 'L\'email è obbligatoria',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Email non valida'
                  }
                })}
              />
            </div>
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <div className="relative">
              <LockClosedIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="password"
                className="input-field pl-10"
                placeholder="••••••••"
                {...register('password', { required: 'La password è obbligatoria' })}
              />
            </div>
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input type="checkbox" className="rounded border-gray-300" />
              <span className="ml-2 text-sm text-gray-600">Ricordami</span>
            </label>
            <div className="flex gap-4">
              <Link to="/forgot-password" className="text-sm text-primary-500 hover:underline">
                Hai dimenticato la password?
              </Link>
              <Link to="/reset-password" className="text-sm text-primary-500 hover:underline">
                Ho già un token
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn btn-primary"
          >
            {loading ? 'Accesso in corso...' : 'Accedi'}
          </button>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={async () => {
                setLoading(true)
                await login('owner1@demo.com', 'password123')
                setLoading(false)
              }}
              className="btn bg-gray-200 text-gray-700 text-sm"
            >
              Demo Proprietario
            </button>
            <button
              type="button"
              onClick={async () => {
                setLoading(true)
                await login('seeker1@demo.com', 'password123')
                setLoading(false)
              }}
              className="btn bg-gray-200 text-gray-700 text-sm"
            >
              Demo Cercatore
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Non hai un account?{' '}
            <Link to="/register" className="text-primary-500 font-semibold hover:underline">
              Registrati qui
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default Login
