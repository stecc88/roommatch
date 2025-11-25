import prisma from '../prisma/client.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

export const register = async (req, res) => {
    const {
        email,
        password,
        name,
        role,
        birthDay,
        birthMonth,
        birthYear,
        birthDate,
        gender,
        bio,
        cityActual,
        ciudadBusquedaPiso,
        prefieroCompartirCon,
        appModes,
        objetivoConvivencia,
        interests,
        presupuestoAproximado,
        lifestyle,
    } = req.body;

    try {
        if (!name || name.length < 1 || name.length > 22) {
            return res.status(400).json({ error: 'Nombre inválido' });
        }
        const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
        if (!email || !emailRegex.test(email)) {
            return res.status(400).json({ error: 'Email inválido' });
        }
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!password || !passwordRegex.test(password)) {
            return res.status(400).json({ error: 'Contraseña inválida' });
        }

        let birth;
        if (birthDate) {
            birth = new Date(birthDate);
        } else if (birthDay && birthMonth && birthYear) {
            birth = new Date(parseInt(birthYear), parseInt(birthMonth) - 1, parseInt(birthDay));
        }
        if (!birth || isNaN(birth.getTime())) {
            return res.status(400).json({ error: 'Fecha de nacimiento inválida' });
        }
        const today = new Date();
        const age = today.getFullYear() - birth.getFullYear() - ((today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) ? 1 : 0);
        if (age < 18) {
            return res.status(400).json({ error: 'Debes tener 18 años o más' });
        }

        const uploadedPhotos = (req.files || []).map(f => `${req.protocol}://${req.get('host')}/uploads/${f.filename}`);
        let profilePhotos = uploadedPhotos;
        if (!profilePhotos || profilePhotos.length < 2) {
            return res.status(400).json({ error: 'Debe subir al menos 2 fotos' });
        }
        if (profilePhotos.length > 6) {
            profilePhotos = profilePhotos.slice(0, 6);
        }

        if (!cityActual || !ciudadBusquedaPiso) {
            return res.status(400).json({ error: 'Ciudad actual y ciudad de búsqueda son obligatorias' });
        }

        const roleMap = {
            'OWNER': 'OWNER',
            'SEEKER': 'SEEKER',
            'BOTH': 'BOTH',
        };
        const userRole = roleMap[role] || 'SEEKER';

        const genderValues = ['HOMBRE', 'MUJER', 'NO_BINARIO', 'PREFIERO_NO_DECIR'];
        const genderValue = genderValues.includes(gender) ? gender : null;

        const sharePrefMap = {
            'SOLO_HOMBRES': 'SOLO_HOMBRES',
            'SOLO_MUJERES': 'SOLO_MUJERES',
            'INDISTINTO': 'INDISTINTO',
        };
        const sharePref = sharePrefMap[prefieroCompartirCon] || 'INDISTINTO';

        const appModeValues = ['SOLO_COMPARTIR_PISO', 'PISO_Y_AMISTADES', 'PISO_Y_CITAS'];
        let appModesArr = [];
        if (Array.isArray(appModes)) {
            appModesArr = appModes.filter(v => appModeValues.includes(v));
        } else if (typeof appModes === 'string') {
            let raw;
            try {
                const parsed = JSON.parse(appModes);
                raw = Array.isArray(parsed) ? parsed : [String(appModes)];
            } catch {
                raw = String(appModes).split(',').map(s => s.trim()).filter(Boolean);
            }
            appModesArr = raw.filter(v => appModeValues.includes(v));
        }
        if (!appModesArr.length) {
            return res.status(400).json({ error: 'Debe seleccionar al menos un modo de uso' });
        }

        const objValues = ['CONVIVENCIA_TRANQUILA', 'AMBIENTE_SOCIAL', 'TEMPORAL', 'LARGO_PLAZO', 'NO_CLARO'];
        let objetivosArr = [];
        if (Array.isArray(objetivoConvivencia)) {
            objetivosArr = objetivoConvivencia.filter(v => objValues.includes(v));
        } else if (typeof objetivoConvivencia === 'string') {
            let raw;
            try {
                const parsed = JSON.parse(objetivoConvivencia);
                raw = Array.isArray(parsed) ? parsed : [String(objetivoConvivencia)];
            } catch {
                raw = String(objetivoConvivencia).split(',').map(s => s.trim()).filter(Boolean);
            }
            objetivosArr = raw.filter(v => objValues.includes(v));
        }

        let interestsArr = [];
        if (interests) {
            interestsArr = Array.isArray(interests)
                ? interests
                : String(interests).split(',').map(s => s.trim()).filter(Boolean);
            if (interestsArr.length > 5) interestsArr = interestsArr.slice(0, 5);
        }

        const presupuesto = presupuestoAproximado ? parseInt(presupuestoAproximado) : null;
        const bioText = bio ? String(bio).slice(0, 500) : null;
        const lifestyleJson = lifestyle ? (typeof lifestyle === 'string' ? JSON.parse(lifestyle) : lifestyle) : null;

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return res.status(400).json({ error: 'El email ya está registrado' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role: userRole,
                birthDate: birth,
                gender: genderValue,
                bio: bioText,
                profilePhotos,
                cityActual,
                ciudadBusquedaPiso,
                prefieroCompartirCon: sharePref,
                appModes: appModesArr,
                objetivoConvivencia: objetivosArr,
                interests: interestsArr,
                presupuestoAproximado: presupuesto,
                lifestyle: lifestyleJson || undefined,
            },
        });

        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: 'Datos inválidos' });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ error: 'Email y contraseña requeridos' });
        }
        let user = await prisma.user.findUnique({ where: { email } });
        if (!user && /@demo\.com$/i.test(email)) {
            const isOwner = /^owner\d*@demo\.com$/i.test(email);
            const isSeeker = /^seeker\d*@demo\.com$/i.test(email);
            const role = isOwner ? 'OWNER' : (isSeeker ? 'SEEKER' : 'SEEKER');
            const hashedPassword = await bcrypt.hash('password123', 10);
            const placeholderPhotos = [
                'https://i.pravatar.cc/300?u=' + encodeURIComponent(email) + '-1',
                'https://i.pravatar.cc/300?u=' + encodeURIComponent(email) + '-2',
            ];
            user = await prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    name: role === 'OWNER' ? 'Demo Propietario' : 'Demo Buscador',
                    role,
                    birthDate: new Date(1995, 0, 1),
                    gender: 'HOMBRE',
                    bio: 'Cuenta demo para pruebas',
                    profilePhotos: placeholderPhotos,
                    cityActual: 'Ciudad Demo',
                    ciudadBusquedaPiso: 'Ciudad Demo',
                    prefieroCompartirCon: 'INDISTINTO',
                    appModes: ['SOLO_COMPARTIR_PISO'],
                    objetivoConvivencia: [],
                    interests: ['Música', 'Tecnología'],
                    languages: ['Español'],
                    presupuestoAproximado: null,
                    lifestyle: { smoker: false, pets: false, schedule: 'Diurno' },
                }
            });
        }
        if (!user) return res.status(400).json({ error: 'User not found' });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ error: 'Invalid password' });

        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
    } catch (error) {
        console.error(error);
        const payload = { error: 'Internal server error' };
        if (process.env.NODE_ENV !== 'production') {
            payload.detail = error.message;
        }
        res.status(500).json(payload);
    }
};

export const getMe = async (req, res) => {
    // req.user is set by middleware
    res.json(req.user);
};

export const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.json({ success: true });
        const resetToken = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '15m' });
        const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
        console.log(`Password reset link: ${FRONTEND_URL}/reset-password?token=${resetToken}`);
        const payload = { success: true };
        if (process.env.NODE_ENV !== 'production') {
            payload.resetToken = resetToken;
        }
        res.json(payload);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const resetPassword = async (req, res) => {
    const { token, password } = req.body;
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.user.update({ where: { id: payload.id }, data: { password: hashedPassword } });
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: 'Invalid or expired token' });
    }
};

export const logout = async (req, res) => {
    res.json({ success: true });
};
