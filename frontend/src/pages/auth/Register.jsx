import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { UserIcon, EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../../contexts/AuthContext'

const chips = {
  prefCompartir: [
    { label: 'Solo uomini', value: 'SOLO_HOMBRES' },
    { label: 'Solo donne', value: 'SOLO_MUJERES' },
    { label: 'Indifferente', value: 'INDISTINTO' }
  ],
  modos: [
    { label: 'Solo condividere appartamento', value: 'SOLO_COMPARTIR_PISO' },
    { label: 'Appartamento + amicizie', value: 'PISO_Y_AMISTADES' },
    { label: 'Appartamento + appuntamenti', value: 'PISO_Y_CITAS' }
  ],
  objetivos: [
    { label: 'Convivenza tranquilla', value: 'CONVIVENCIA_TRANQUILA' },
    { label: 'Ambiente sociale', value: 'AMBIENTE_SOCIAL' },
    { label: 'Solo temporaneo', value: 'TEMPORAL' },
    { label: 'Lungo periodo', value: 'LARGO_PLAZO' },
    { label: 'Non chiaro', value: 'NO_CLARO' }
  ],
  intereses: ['Palestra','Leggere','Musica','Videogiochi','Cinema','Cucinare','Fotografia','Viaggiare','Arte','Tecnologia'],
  idiomas: ['Spagnolo','Inglese','Portoghese','Francese','Tedesco','Italiano','Cinese','Giapponese','Coreano']
}

const Register = () => {
  const navigate = useNavigate()
  const { register: registerForm, handleSubmit, formState: { errors }, watch, setValue, getValues } = useForm()
  const { register } = useAuth()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [photos, setPhotos] = useState([])
  const [modos, setModos] = useState([])
  const [objetivos, setObjetivos] = useState([])
  const [interesesSel, setInteresesSel] = useState([])
  const [idiomasSel, setIdiomasSel] = useState([])
  const password = watch('password')

  const name = watch('name')
  const email = watch('email')
  const confirmPassword = watch('confirmPassword')
  const birthDay = watch('birthDay')
  const birthMonth = watch('birthMonth')
  const birthYear = watch('birthYear')
  const gender = watch('gender')
  const cityActual = watch('cityActual')
  const ciudadBusquedaPiso = watch('ciudadBusquedaPiso')
  const role = watch('role')
  const prefieroCompartirCon = watch('prefieroCompartirCon')

  const canNext = useMemo(() => {
    if (step === 1) {
      return (
        name && email && password && confirmPassword && birthDay && birthMonth && birthYear && gender && password === confirmPassword
      )
    }
    if (step === 2) return photos.length >= 2
    if (step === 3) {
      return cityActual && ciudadBusquedaPiso
    }
    if (step === 4) return !!role
    if (step === 5) return !!prefieroCompartirCon
    if (step === 6) return modos.length > 0
    return true
  }, [step, photos.length, modos.length, name, email, password, confirmPassword, birthDay, birthMonth, birthYear, gender, cityActual, ciudadBusquedaPiso, role, prefieroCompartirCon])

  const addPhotoFiles = (files) => {
    const arr = Array.from(files || [])
    const next = [...photos, ...arr].slice(0, 6)
    setPhotos(next)
  }

  const toggleChip = (list, setList, value) => {
    setList(list.includes(value) ? list.filter(v => v !== value) : [...list, value])
  }

  const toggleInterest = (value) => {
    setInteresesSel(prev => {
      if (prev.includes(value)) return prev.filter(v => v !== value)
      if (prev.length >= 5) return prev
      return [...prev, value]
    })
  }

  const toggleIdioma = (value) => {
    setIdiomasSel(prev => {
      if (prev.includes(value)) return prev.filter(v => v !== value)
      if (prev.length >= 5) return prev
      return [...prev, value]
    })
  }

  const onSubmit = async () => {
    const v = getValues()
    const fd = new FormData()
    fd.append('name', v.name)
    fd.append('email', v.email)
    fd.append('password', v.password)
    fd.append('birthDay', v.birthDay)
    fd.append('birthMonth', v.birthMonth)
    fd.append('birthYear', v.birthYear)
    fd.append('gender', v.gender)
    fd.append('cityActual', v.cityActual)
    fd.append('ciudadBusquedaPiso', v.ciudadBusquedaPiso)
    fd.append('role', v.role)
    fd.append('prefieroCompartirCon', v.prefieroCompartirCon)
    modos.forEach(m => fd.append('appModes', m))
    objetivos.forEach(o => fd.append('objetivoConvivencia', o))
    interesesSel.forEach(i => fd.append('interests', i))
    idiomasSel.forEach(l => fd.append('languages', l))
    if (v.bio) fd.append('bio', v.bio)
    if (v.presupuestoAproximado) fd.append('presupuestoAproximado', v.presupuestoAproximado)
    const lifestyle = {
      smoker: String(v.smoker) === 'true',
      pets: String(v.pets) === 'true',
      schedule: v.schedule || ''
    }
    fd.append('lifestyle', JSON.stringify(lifestyle))
    photos.forEach(file => fd.append('profilePhotos', file))
    setLoading(true)
    const res = await register(fd)
    setLoading(false)
    if (res?.success) navigate('/discover')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-500 to-primary-500 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold gradient-text mb-2">Crea il tuo account</h1>
          <p className="text-gray-600">Condividere casa è il focus. Appuntamenti sono opzionali.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {step === 1 && (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input type="text" className="input-field pl-10" placeholder="Il tuo nome" {...registerForm('name', { required: true, minLength: 1, maxLength: 22 })} />
                </div>
                {errors.name && <p className="text-red-500 text-sm mt-1">Nome non valido</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <div className="relative">
                  <EnvelopeIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input type="email" className="input-field pl-10" placeholder="tu@email.com" {...registerForm('email', { required: true, pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i })} />
                </div>
                {errors.email && <p className="text-red-500 text-sm mt-1">Email non valida</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <LockClosedIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input type="password" className="input-field pl-10" placeholder="••••••••" {...registerForm('password', { required: true, pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/ })} />
                </div>
                {errors.password && <p className="text-red-500 text-sm mt-1">Password non valida</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Conferma</label>
                <input type="password" className="input-field" {...registerForm('confirmPassword', { required: true, validate: value => value === password })} />
                {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">Non coincide</p>}
              </div>
              <div className="grid grid-cols-3 gap-3 md:col-span-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Día</label>
                  <input type="number" min="1" max="31" className="input-field" {...registerForm('birthDay', { required: true })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mes</label>
                  <input type="number" min="1" max="12" className="input-field" {...registerForm('birthMonth', { required: true })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Año</label>
                  <input type="number" min="1900" max={new Date().getFullYear()} className="input-field" {...registerForm('birthYear', { required: true })} />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Genere</label>
                <select className="input-field" {...registerForm('gender', { required: true })}>
                  <option value="">Seleziona...</option>
                  <option value="HOMBRE">Uomo</option>
                  <option value="MUJER">Donna</option>
                  <option value="NO_BINARIO">Non binario</option>
                  <option value="PREFIERO_NO_DECIR">Preferisco non dirlo</option>
                </select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Foto profilo (2–6)</label>
              <input type="file" accept="image/*" multiple onChange={(e) => addPhotoFiles(e.target.files)} />
              <div className="grid grid-cols-3 gap-3 mt-3">
                {photos.map((f, i) => (
                  <div key={i} className="relative">
                    <img src={URL.createObjectURL(f)} alt="profile" className="w-full h-28 object-cover rounded-lg" />
                  </div>
                ))}
              </div>
              {photos.length < 2 && <p className="text-red-500 text-sm mt-2">Carica almeno 2 foto</p>}
            </div>
          )}

          {step === 3 && (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Città attuale</label>
                <input type="text" className="input-field" placeholder="Ej: Buenos Aires - Palermo" {...registerForm('cityActual', { required: true })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Città dove cerchi</label>
                <input type="text" className="input-field" placeholder="Ej: Buenos Aires - Caballito" {...registerForm('ciudadBusquedaPiso', { required: true })} />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="grid md:grid-cols-3 gap-3">
              {[
                { label: 'Ho un appartamento e cerco coinquilino/a', value: 'OWNER' },
                { label: 'Non ho appartamento e cerco stanza', value: 'SEEKER' },
                { label: 'Indifferente: ho flessibilità', value: 'BOTH' }
              ].map(o => (
                <button type="button" key={o.value} onClick={() => setValue('role', o.value)} className={`px-3 py-2 rounded-xl border ${getValues('role') === o.value ? 'bg-primary-100 border-primary-300 text-primary-700' : 'bg-gray-100 border-gray-200 text-gray-700'}`}>{o.label}</button>
              ))}
            </div>
          )}

          {step === 5 && (
            <div className="grid md:grid-cols-3 gap-3">
              {chips.prefCompartir.map(c => (
                <button type="button" key={c.value} onClick={() => setValue('prefieroCompartirCon', c.value)} className={`px-3 py-2 rounded-xl border ${getValues('prefieroCompartirCon') === c.value ? 'bg-primary-100 border-primary-300 text-primary-700' : 'bg-gray-100 border-gray-200 text-gray-700'}`}>{c.label}</button>
              ))}
            </div>
          )}

          {step === 6 && (
            <div className="grid md:grid-cols-3 gap-3">
              {chips.modos.map(c => (
                <button type="button" key={c.value} onClick={() => toggleChip(modos, setModos, c.value)} className={`px-3 py-2 rounded-xl border ${modos.includes(c.value) ? 'bg-primary-100 border-primary-300 text-primary-700' : 'bg-gray-100 border-gray-200 text-gray-700'}`}>{c.label}</button>
              ))}
            </div>
          )}

          {step === 7 && (
            <div className="grid md:grid-cols-3 gap-3">
              {chips.objetivos.map(c => (
                <button type="button" key={c.value} onClick={() => toggleChip(objetivos, setObjetivos, c.value)} className={`px-3 py-2 rounded-xl border ${objetivos.includes(c.value) ? 'bg-primary-100 border-primary-300 text-primary-700' : 'bg-gray-100 border-gray-200 text-gray-700'}`}>{c.label}</button>
              ))}
            </div>
          )}

          {step === 8 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Interessi (opzionale, fino a 5)</label>
              <div className="flex flex-wrap gap-2">
                {chips.intereses.map(i => (
                  <button key={i} type="button" onClick={() => toggleInterest(i)} className={`px-3 py-1 rounded-full text-sm border ${interesesSel.includes(i) ? 'bg-primary-100 border-primary-300 text-primary-700' : 'bg-gray-100 border-gray-200 text-gray-700'}`}>{i}</button>
                ))}
              </div>
              <label className="block text-sm font-medium text-gray-700 mb-2 mt-4">Lingue (opzionale, fino a 5)</label>
              <div className="flex flex-wrap gap-2">
                {chips.idiomas.map(i => (
                  <button key={i} type="button" onClick={() => toggleIdioma(i)} className={`px-3 py-1 rounded-full text-sm border ${idiomasSel.includes(i) ? 'bg-secondary-100 border-secondary-300 text-secondary-700' : 'bg-gray-100 border-gray-200 text-gray-700'}`}>{i}</button>
                ))}
              </div>
            </div>
          )}

          {step === 9 && (
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Bio (opzionale)</label>
                <textarea rows="4" className="input-field" maxLength={500} {...registerForm('bio')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Budget approssimativo</label>
                <input type="number" min="0" className="input-field" {...registerForm('presupuestoAproximado')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fumo</label>
                <select className="input-field" {...registerForm('smoker')}>
                  <option value="">Seleziona...</option>
                  <option value="true">Sì</option>
                  <option value="false">No</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Animali domestici</label>
                <select className="input-field" {...registerForm('pets')}>
                  <option value="">Seleziona...</option>
                  <option value="true">Sì</option>
                  <option value="false">No</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Orari</label>
                <select className="input-field" {...registerForm('schedule')}>
                  <option value="">Seleziona...</option>
                  <option value="Diurno">Diurno</option>
                  <option value="Nocturno">Notturno</option>
                  <option value="Turnos">Turni</option>
                </select>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-6">
            <button type="button" className="btn bg-gray-200 text-gray-800" onClick={() => setStep(s => Math.max(1, s - 1))}>Indietro</button>
            {step < 9 ? (
              <button type="button" disabled={!canNext} className="btn btn-primary" onClick={() => setStep(s => s + 1)}>Avanti</button>
            ) : (
              <button type="submit" disabled={loading || !canNext} className="btn btn-primary">{loading ? 'Creazione account...' : 'Crea Account'}</button>
            )}
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">Hai già un account? <Link to="/login" className="text-primary-500 font-semibold hover:underline">Accedi</Link></p>
        </div>
      </motion.div>
    </div>
  )
}

export default Register
