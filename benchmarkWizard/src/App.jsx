import { Routes, Route } from 'react-router-dom'
import Login from './pages/Logins'
import SubmitForm from './pages/SubmitForm'
import Header from './components/Header'
import Footer from './components/Footer'
import PropertyForm from './pages/PropertyForm'
import UtilityForm from './components/UtilityForm'

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow p-4">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/submit" element={<SubmitForm />} />
          <Route path="/addProperty" element={<PropertyForm />} />
   <Route path="/utility" element={<UtilityForm />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
