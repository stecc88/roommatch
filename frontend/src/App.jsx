import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { Toaster } from 'react-hot-toast'
import { I18nProvider } from './i18n/i18n.jsx'
import { AuthProvider } from './contexts/AuthContext'
import MainLayout from './components/layout/MainLayout'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'
import Home from './pages/home/Home'
import Discover from './pages/matches/Discover'
import Matches from './pages/matches/Matches'
import Chat from './pages/chat/Chat'
import ListingDetail from './pages/rooms/ListingDetail'
import Rooms from './pages/rooms/Rooms'
import CreateListing from './pages/listings/CreateListing'
import Notifications from './pages/notifications/Notifications'
import MyListings from './pages/listings/MyListings'
import Profile from './pages/profile/Profile'
import ProtectedRoute from './components/common/ProtectedRoute'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <I18nProvider initialLocale="it">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/discover" element={<Discover />} />
                <Route path="/matches" element={<Matches />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/chat/:matchId" element={<Chat />} />
                <Route path="/rooms" element={<Rooms />} />
                <Route path="/my-listings" element={<MyListings />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/rooms/new" element={<CreateListing />} />
                <Route path="/notifications" element={<Notifications />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster position="top-center" />
          </I18nProvider>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  )
}

export default App
