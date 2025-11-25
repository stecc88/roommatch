import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import MobileNav from './MobileNav'
import useSocket from '../../hooks/useSocket'

const MainLayout = () => {
  useSocket()
  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <Navbar />
      <main className="container mx-auto px-4 py-8 md:grid md:grid-cols-12 md:gap-6">
        <Sidebar />
        <section className="md:col-span-9 lg:col-span-10">
          <Outlet />
        </section>
      </main>
      <MobileNav />
    </div>
  )
}

export default MainLayout
