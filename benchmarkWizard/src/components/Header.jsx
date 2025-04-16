import { Link } from 'react-router-dom'

const Header = () => (
  <header className="bg-blue-600 text-white p-4 flex justify-between items-center">
    <h1 className="text-xl font-bold">My App</h1>
    <nav className="space-x-4">
      <Link to="/" className="hover:underline">Login</Link>
      <Link to="/submit" className="hover:underline">Submit Form</Link>
    </nav>
  </header>
)

export default Header
