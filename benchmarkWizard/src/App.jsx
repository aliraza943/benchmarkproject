import { Routes, Route } from 'react-router-dom'
import Login from './pages/Logins'
import SubmitForm from './pages/SubmitForm'
import Header from './components/Header'
import Footer from './components/Footer'
import PropertyForm from './pages/PropertyForm'

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow p-4">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/submit" element={<SubmitForm />} />
          <Route path="/addProperty" element={<PropertyForm />} />

        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
