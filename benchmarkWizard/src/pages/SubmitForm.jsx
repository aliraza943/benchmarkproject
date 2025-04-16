import { useEffect, useState } from 'react'

const SubmitForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    message: ''
  })

  // Store access token & user info from URL on first render
  useEffect(() => {
    const hash = window.location.hash
    if (hash.includes('access_token')) {
      const params = new URLSearchParams(hash.substring(1)) // remove '#' at start
      const access_token = params.get('access_token')
      const refresh_token = params.get('refresh_token')
      const expires_in = params.get('expires_in')
      const token_type = params.get('token_type')

      // Optional: store entire token object
      localStorage.setItem('access_token', access_token)
      localStorage.setItem('refresh_token', refresh_token)
      localStorage.setItem('expires_in', expires_in)
      localStorage.setItem('token_type', token_type)

      // Clear hash from URL
      window.history.replaceState(null, '', window.location.pathname)
    }
  }, [])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem('access_token')

    if (!token) {
      alert('You must be logged in to submit.')
      return
    }

    try {
      const response = await fetch('http://localhost:5000/submit-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      if (response.ok) {
        alert(`✅ Submitted: ${data.message}`)
      } else {
        alert(`❌ Error: ${data.error}`)
      }
    } catch (error) {
      console.error('Submit failed:', error)
      alert('Something went wrong.')
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Submit Something</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Your Name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />
        <textarea
          name="message"
          placeholder="Your Message"
          value={formData.message}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />
        <button type="submit" className="w-full bg-green-600 text-white p-2 rounded">
          Submit
        </button>
      </form>
    </div>
  )
}

export default SubmitForm
