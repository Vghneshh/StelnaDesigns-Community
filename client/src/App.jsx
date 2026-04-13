import { useState, useRef, useEffect } from 'react'
import SearchBar from './components/SearchBar'
import ResultCard from './components/ResultCard'
import RotatingWord from './components/RotatingWord'
import LoadingGrid from './components/LoadingGrid'

const SITES = ['Thingiverse', 'Cults3D', 'MyMiniFactory', 'Sketchfab']

const Footer = () => (
  <footer style={{
    padding: '24px 0',
    borderTop: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    fontFamily: 'var(--sans)',
    fontSize: '12px',
    fontWeight: '500',
    color: 'var(--text2)',
    letterSpacing: '0.2px',
    marginTop: '20px',
  }}>
    <span>Bhuve.com © owned by Stelna Designs LLP</span>
  </footer>
)

export default function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [query, setQuery] = useState('')
  const [time, setTime] = useState(0)
  const [error, setError] = useState(null)
  const [fileFilter, setFileFilter] = useState('ALL')
  const esRef = useRef(null)

  // Load page from URL hash on mount
  useEffect(() => {
    const hash = window.location.hash.slice(1) || 'home'
    setCurrentPage(hash)
    window.addEventListener('hashchange', () => {
      const newHash = window.location.hash.slice(1) || 'home'
      setCurrentPage(newHash)
    })
  }, [])

  function openWhatsApp() {
    const message = encodeURIComponent(`Hello, I would like to request a part analysis.

I will share an image of the part. Please help me identify it and suggest the correct match.`)
    const whatsappUrl = `https://wa.me/919110440617?text=${message}`
    window.open(whatsappUrl, "_blank")
  }

  function handleSearch(q) {
    if (esRef.current) {
      esRef.current.close()
      esRef.current = null
    }

    // Update URL with search page
    window.location.hash = 'search'

    setLoading(true)
    setResults([])
    setFileFilter('ALL')
    setSearched(false)
    setError(null)
    setQuery(q)
    const start = Date.now()

    const es = new EventSource(`${import.meta.env.VITE_API_URL}/api/search/stream?q=${encodeURIComponent(q)}`)
    esRef.current = es

    es.onmessage = (e) => {
      const data = JSON.parse(e.data)

      if (data.done) {
        es.close()
        esRef.current = null
        setLoading(false)
        setSearched(true)
        setTime(((Date.now() - start) / 1000).toFixed(2))
        return
      }

      if (data.results && data.results.length > 0) {
        setSearched(true)
        setResults(prev => {
          const seen = new Set(prev.map(r => r.url))
          const newOnes = data.results.filter(r => r.url && !seen.has(r.url))
          return [...prev, ...newOnes]
        })
      }
    }

    es.onerror = () => {
      es.close()
      esRef.current = null
      setLoading(false)
      setSearched(true)
      setError('Could not reach the server. Make sure the backend is running.')
    }
  }

  const ManufacturePage = () => {
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      organisation: '',
      role: '',
      fileOrLink: '',
      requirements: '',
    })
    const [mfgLoading, setMfgLoading] = useState(false)
    const [mfgMessage, setMfgMessage] = useState(null)

    const handleInputChange = (e) => {
      const { name, value } = e.target
      setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
      e.preventDefault()
      setMfgLoading(true)
      setMfgMessage(null)

      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/forms/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            formType: 'manufacture',
            payload: formData
          })
        })

        if (!response.ok) {
          const contentType = response.headers.get('content-type') || ''
          if (contentType.includes('application/json')) {
            const error = await response.json()
            throw new Error(error.error || 'Failed to submit form')
          }

          const text = await response.text()
          throw new Error(text || `Failed to submit form (HTTP ${response.status})`)
        }

        setMfgMessage({ type: 'success', text: 'Thank you! Your manufacturing request has been received. Our team will contact you soon.' })
        setFormData({
          name: '',
          email: '',
          organisation: '',
          role: '',
          fileOrLink: '',
          requirements: '',
        })
      } catch (err) {
        setMfgMessage({ type: 'error', text: err.message || 'Failed to submit form. Please try again.' })
      } finally {
        setMfgLoading(false)
      }
    }

    return (
      <div style={{ padding: '30px 0 60px', maxWidth: '560px', margin: '0 auto' }}>
        <h1 style={{ fontFamily: 'var(--sans)', fontSize: '36px', fontWeight: '700', marginBottom: '10px', color: 'var(--text)', textAlign: 'center' }}>
          Manufacture
        </h1>
        <p style={{ fontFamily: 'var(--mono)', fontSize: '14px', color: 'var(--text2)', lineHeight: '1.8', marginBottom: '40px', textAlign: 'center' }}>
          Submit your CAD models and requirements for manufacturing services.
        </p>

        {mfgMessage && (
          <div style={{
            padding: '14px 16px',
            marginBottom: '24px',
            borderRadius: '8px',
            background: mfgMessage.type === 'success' ? 'rgba(34, 197, 94, 0.05)' : 'rgba(239, 68, 68, 0.05)',
            border: `1px solid ${mfgMessage.type === 'success' ? '#22c55e' : '#ef4444'}`,
            color: mfgMessage.type === 'success' ? '#15803d' : '#991b1b',
            fontFamily: 'var(--mono)',
            fontSize: '13px',
            lineHeight: '1.6',
          }}>
            {mfgMessage.text}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ maxWidth: '560px', margin: '0 auto', padding: '40px', border: '1px solid var(--border)', borderRadius: '12px', background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          {/* Name */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontFamily: 'var(--sans)', fontSize: '14px', color: 'var(--text)', fontWeight: '700', display: 'block', marginBottom: '10px', letterSpacing: '0.3px' }}>
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="Enter your name"
              style={{
                width: '100%',
                padding: '12px 14px',
                fontFamily: 'var(--sans)',
                fontSize: '14px',
                border: '1px solid #e0e0e0',
                borderRadius: '6px',
                background: '#fff',
                color: 'var(--text)',
                boxSizing: 'border-box',
                transition: 'all 0.2s',
                outline: 'none',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--amber)'
                e.target.style.boxShadow = '0 0 0 3px rgba(217,119,6,0.08)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e0e0e0'
                e.target.style.boxShadow = 'none'
              }}
            />
          </div>

          {/* Email */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontFamily: 'var(--sans)', fontSize: '14px', color: 'var(--text)', fontWeight: '700', display: 'block', marginBottom: '10px', letterSpacing: '0.3px' }}>
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              placeholder="your.email@example.com"
              style={{
                width: '100%',
                padding: '12px 14px',
                fontFamily: 'var(--sans)',
                fontSize: '14px',
                border: '1px solid #e0e0e0',
                borderRadius: '6px',
                background: '#fff',
                color: 'var(--text)',
                boxSizing: 'border-box',
                transition: 'all 0.2s',
                outline: 'none',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--amber)'
                e.target.style.boxShadow = '0 0 0 3px rgba(217,119,6,0.08)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e0e0e0'
                e.target.style.boxShadow = 'none'
              }}
            />
          </div>

          {/* Organisation */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontFamily: 'var(--sans)', fontSize: '14px', color: 'var(--text)', fontWeight: '700', display: 'block', marginBottom: '10px', letterSpacing: '0.3px' }}>
              Organisation
            </label>
            <input
              type="text"
              name="organisation"
              value={formData.organisation}
              onChange={handleInputChange}
              placeholder="Your company/organisation"
              style={{
                width: '100%',
                padding: '12px 14px',
                fontFamily: 'var(--sans)',
                fontSize: '14px',
                border: '1px solid #e0e0e0',
                borderRadius: '6px',
                background: '#fff',
                color: 'var(--text)',
                boxSizing: 'border-box',
                transition: 'all 0.2s',
                outline: 'none',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--amber)'
                e.target.style.boxShadow = '0 0 0 3px rgba(217,119,6,0.08)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e0e0e0'
                e.target.style.boxShadow = 'none'
              }}
            />
          </div>

          {/* Role */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontFamily: 'var(--sans)', fontSize: '14px', color: 'var(--text)', fontWeight: '700', display: 'block', marginBottom: '10px', letterSpacing: '0.3px' }}>
              Role
            </label>
            <input
              type="text"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              placeholder="Your role/position"
              style={{
                width: '100%',
                padding: '12px 14px',
                fontFamily: 'var(--sans)',
                fontSize: '14px',
                border: '1px solid #e0e0e0',
                borderRadius: '6px',
                background: '#fff',
                color: 'var(--text)',
                boxSizing: 'border-box',
                transition: 'all 0.2s',
                outline: 'none',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--amber)'
                e.target.style.boxShadow = '0 0 0 3px rgba(217,119,6,0.08)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e0e0e0'
                e.target.style.boxShadow = 'none'
              }}
            />
          </div>

          {/* File or Link */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontFamily: 'var(--sans)', fontSize: '14px', color: 'var(--text)', fontWeight: '700', display: 'block', marginBottom: '10px', letterSpacing: '0.3px' }}>
              Paste your file or link
            </label>
            <textarea
              name="fileOrLink"
              value={formData.fileOrLink}
              onChange={handleInputChange}
              placeholder="Paste your file URL or link here..."
              style={{
                width: '100%',
                padding: '12px 14px',
                fontFamily: 'var(--mono)',
                fontSize: '14px',
                border: '1px solid #e0e0e0',
                borderRadius: '6px',
                background: '#fff',
                color: 'var(--text)',
                boxSizing: 'border-box',
                minHeight: '60px',
                resize: 'vertical',
                transition: 'all 0.2s',
                outline: 'none',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--amber)'
                e.target.style.boxShadow = '0 0 0 3px rgba(217,119,6,0.08)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e0e0e0'
                e.target.style.boxShadow = 'none'
              }}
            />
          </div>

          {/* Requirements */}
          <div style={{ marginBottom: '30px' }}>
            <label style={{ fontFamily: 'var(--sans)', fontSize: '14px', color: 'var(--text)', fontWeight: '700', display: 'block', marginBottom: '10px', letterSpacing: '0.3px' }}>
              Requirements
            </label>
            <textarea
              name="requirements"
              value={formData.requirements}
              onChange={handleInputChange}
              required
              placeholder="Describe your manufacturing requirements, specifications, materials, etc."
              style={{
                width: '100%',
                padding: '12px',
                fontFamily: 'var(--mono)',
                fontSize: '14px',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                background: 'var(--bg2)',
                color: 'var(--text)',
                boxSizing: 'border-box',
                minHeight: '120px',
                resize: 'vertical',
              }}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={mfgLoading}
            style={{
              width: '100%',
              fontFamily: 'var(--mono)',
              fontSize: '14px',
              padding: '14px',
              background: mfgLoading ? '#cccccc' : 'var(--amber)',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: mfgLoading ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              letterSpacing: '0.8px',
              textTransform: 'uppercase',
              transition: 'all 0.3s',
              boxShadow: '0 2px 8px rgba(217,119,6,0.15)',
            }}
            onMouseEnter={(e) => {
              if (!mfgLoading) {
                e.target.style.background = '#cc6a00'
                e.target.style.transform = 'translateY(-2px)'
                e.target.style.boxShadow = '0 4px 12px rgba(217,119,6,0.25)'
              }
            }}
            onMouseLeave={(e) => {
              if (!mfgLoading) {
                e.target.style.background = 'var(--amber)'
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = '0 2px 8px rgba(217,119,6,0.15)'
              }
            }}
            onMouseDown={(e) => {
              if (!mfgLoading) {
                e.target.style.transform = 'translateY(0)'
              }
            }}
          >
            {mfgLoading ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>
        <Footer />
      </div>
    )
  }

  const CustomDesignPage = () => {
    const [designForm, setDesignForm] = useState({
      name: '',
      email: '',
      organisation: '',
      role: '',
      designRequirements: '',
    })
    const [designLoading, setDesignLoading] = useState(false)
    const [designMessage, setDesignMessage] = useState(null)

    const handleDesignChange = (e) => {
      const { name, value } = e.target
      setDesignForm(prev => ({ ...prev, [name]: value }))
    }

    const handleDesignSubmit = async (e) => {
      e.preventDefault()
      setDesignLoading(true)
      setDesignMessage(null)

      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/forms/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            formType: 'custom-design',
            payload: designForm
          })
        })

        if (!response.ok) {
          const contentType = response.headers.get('content-type') || ''
          if (contentType.includes('application/json')) {
            const error = await response.json()
            throw new Error(error.error || 'Failed to submit form')
          }

          const text = await response.text()
          throw new Error(text || `Failed to submit form (HTTP ${response.status})`)
        }

        setDesignMessage({ type: 'success', text: 'Thank you! Your custom design request has been received. Our team will contact you soon.' })
        setDesignForm({
          name: '',
          email: '',
          organisation: '',
          role: '',
          designRequirements: '',
        })
      } catch (err) {
        setDesignMessage({ type: 'error', text: err.message || 'Failed to submit form. Please try again.' })
      } finally {
        setDesignLoading(false)
      }
    }

    return (
      <div style={{ padding: '30px 0 60px', maxWidth: '500px', margin: '0 auto' }}>
        <h1 style={{ fontFamily: 'var(--sans)', fontSize: '36px', fontWeight: '700', marginBottom: '10px', color: 'var(--text)', textAlign: 'center' }}>
          Custom Design
        </h1>
        <p style={{ fontFamily: 'var(--mono)', fontSize: '14px', color: 'var(--text2)', lineHeight: '1.8', marginBottom: '40px', textAlign: 'center' }}>
          Request custom CAD designs tailored to your specifications. Our team will work with you to bring your ideas to life.
        </p>

        {designMessage && (
          <div style={{
            padding: '14px 16px',
            marginBottom: '24px',
            borderRadius: '8px',
            background: designMessage.type === 'success' ? 'rgba(34, 197, 94, 0.05)' : 'rgba(239, 68, 68, 0.05)',
            border: `1px solid ${designMessage.type === 'success' ? '#22c55e' : '#ef4444'}`,
            color: designMessage.type === 'success' ? '#15803d' : '#991b1b',
            fontFamily: 'var(--mono)',
            fontSize: '13px',
            lineHeight: '1.6',
          }}>
            {designMessage.text}
          </div>
        )}

        <form onSubmit={handleDesignSubmit} style={{ maxWidth: '500px', margin: '0 auto', padding: '40px', border: '1px solid var(--border)', borderRadius: '12px', background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          {/* Name */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontFamily: 'var(--sans)', fontSize: '14px', color: 'var(--text)', fontWeight: '700', display: 'block', marginBottom: '10px', letterSpacing: '0.3px' }}>
              Name
            </label>
            <input
              type="text"
              name="name"
              value={designForm.name}
              onChange={handleDesignChange}
              required
              placeholder="Enter your name"
              style={{
                width: '100%',
                padding: '12px 14px',
                fontFamily: 'var(--sans)',
                fontSize: '14px',
                border: '1px solid #e0e0e0',
                borderRadius: '6px',
                background: '#fff',
                color: 'var(--text)',
                boxSizing: 'border-box',
                transition: 'all 0.2s',
                outline: 'none',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--amber)'
                e.target.style.boxShadow = '0 0 0 3px rgba(217,119,6,0.08)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e0e0e0'
                e.target.style.boxShadow = 'none'
              }}
            />
          </div>

          {/* Email */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontFamily: 'var(--sans)', fontSize: '14px', color: 'var(--text)', fontWeight: '700', display: 'block', marginBottom: '10px', letterSpacing: '0.3px' }}>
              Email
            </label>
            <input
              type="email"
              name="email"
              value={designForm.email}
              onChange={handleDesignChange}
              required
              placeholder="your.email@example.com"
              style={{
                width: '100%',
                padding: '12px 14px',
                fontFamily: 'var(--sans)',
                fontSize: '14px',
                border: '1px solid #e0e0e0',
                borderRadius: '6px',
                background: '#fff',
                color: 'var(--text)',
                boxSizing: 'border-box',
                transition: 'all 0.2s',
                outline: 'none',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--amber)'
                e.target.style.boxShadow = '0 0 0 3px rgba(217,119,6,0.08)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e0e0e0'
                e.target.style.boxShadow = 'none'
              }}
            />
          </div>

          {/* Organisation */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontFamily: 'var(--sans)', fontSize: '14px', color: 'var(--text)', fontWeight: '700', display: 'block', marginBottom: '10px', letterSpacing: '0.3px' }}>
              Organisation
            </label>
            <input
              type="text"
              name="organisation"
              value={designForm.organisation}
              onChange={handleDesignChange}
              placeholder="Your company/organisation"
              style={{
                width: '100%',
                padding: '12px 14px',
                fontFamily: 'var(--sans)',
                fontSize: '14px',
                border: '1px solid #e0e0e0',
                borderRadius: '6px',
                background: '#fff',
                color: 'var(--text)',
                boxSizing: 'border-box',
                transition: 'all 0.2s',
                outline: 'none',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--amber)'
                e.target.style.boxShadow = '0 0 0 3px rgba(217,119,6,0.08)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e0e0e0'
                e.target.style.boxShadow = 'none'
              }}
            />
          </div>

          {/* Role */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontFamily: 'var(--sans)', fontSize: '14px', color: 'var(--text)', fontWeight: '700', display: 'block', marginBottom: '10px', letterSpacing: '0.3px' }}>
              Role
            </label>
            <input
              type="text"
              name="role"
              value={designForm.role}
              onChange={handleDesignChange}
              placeholder="Your role/position"
              style={{
                width: '100%',
                padding: '12px 14px',
                fontFamily: 'var(--sans)',
                fontSize: '14px',
                border: '1px solid #e0e0e0',
                borderRadius: '6px',
                background: '#fff',
                color: 'var(--text)',
                boxSizing: 'border-box',
                transition: 'all 0.2s',
                outline: 'none',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--amber)'
                e.target.style.boxShadow = '0 0 0 3px rgba(217,119,6,0.08)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e0e0e0'
                e.target.style.boxShadow = 'none'
              }}
            />
          </div>

          {/* Design Requirements */}
          <div style={{ marginBottom: '30px' }}>
            <label style={{ fontFamily: 'var(--sans)', fontSize: '14px', color: 'var(--text)', fontWeight: '700', display: 'block', marginBottom: '10px', letterSpacing: '0.3px' }}>
              Design Requirements <span style={{ color: 'var(--red)' }}>*</span>
            </label>
            <textarea
              name="designRequirements"
              value={designForm.designRequirements}
              onChange={handleDesignChange}
              required
              placeholder="Describe your design needs, specifications, materials, dimensions, features, etc."
              style={{
                width: '100%',
                padding: '12px',
                fontFamily: 'var(--mono)',
                fontSize: '14px',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                background: 'var(--bg2)',
                color: 'var(--text)',
                boxSizing: 'border-box',
                minHeight: '120px',
                resize: 'vertical',
              }}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={designLoading}
            style={{
              width: '100%',
              fontFamily: 'var(--mono)',
              fontSize: '14px',
              padding: '14px',
              background: designLoading ? '#cccccc' : 'var(--amber)',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: designLoading ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              letterSpacing: '0.8px',
              textTransform: 'uppercase',
              transition: 'all 0.3s',
              boxShadow: '0 2px 8px rgba(217,119,6,0.15)',
            }}
            onMouseEnter={(e) => {
              if (!designLoading) {
                e.target.style.background = '#cc6a00'
                e.target.style.transform = 'translateY(-2px)'
                e.target.style.boxShadow = '0 4px 12px rgba(217,119,6,0.25)'
              }
            }}
            onMouseLeave={(e) => {
              if (!designLoading) {
                e.target.style.background = 'var(--amber)'
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = '0 2px 8px rgba(217,119,6,0.15)'
              }
            }}
            onMouseDown={(e) => {
              if (!designLoading) {
                e.target.style.transform = 'translateY(0)'
              }
            }}
          >
            {designLoading ? 'Submitting...' : 'Submit Design Request'}
          </button>
        </form>
        <Footer />
      </div>
    )
  }

  const LearnMorePage = () => (
    <div style={{ padding: '28px 0 40px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        marginBottom: '14px',
        flexWrap: 'wrap',
      }}>
        <h1 style={{
          fontFamily: 'var(--sans)',
          fontSize: '28px',
          fontWeight: '700',
          color: 'var(--text)',
        }}>
          About Stelna Designs
        </h1>
        <a
          href="https://www.stelnadesigns.com/about"
          target="_blank"
          rel="noreferrer"
          style={{
            fontFamily: 'var(--sans)',
            fontSize: '13px',
            color: 'var(--amber)',
            textDecoration: 'none',
            fontWeight: '600',
          }}
        >
          Open original page ↗
        </a>
      </div>

      <div style={{
        border: '1px solid var(--border)',
        borderRadius: '12px',
        background: 'linear-gradient(180deg, rgba(217,119,6,0.08) 0%, #fff 45%)',
        padding: '24px',
      }}>
        <p style={{
          fontFamily: 'var(--sans)',
          fontSize: '15px',
          lineHeight: '1.9',
          color: 'var(--text)',
          marginBottom: '20px',
          maxWidth: '900px',
        }}>
          Stelna Designs helps teams move from concept to production with practical hardware design, CAD support, and manufacturing guidance.
          This quick view keeps the experience clean here, and you can open the full About page for complete details.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '12px',
          marginBottom: '20px',
        }}>
          {[
            { title: 'Design Support', text: 'Custom CAD workflows and engineering collaboration.' },
            { title: 'Manufacturing Focus', text: 'Practical, production-ready decision support.' },
            { title: 'Hardware Mindset', text: 'Built by teams that understand real hardware constraints.' },
          ].map((item) => (
            <div key={item.title} style={{
              padding: '14px',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              background: '#fff',
            }}>
              <h3 style={{
                fontFamily: 'var(--sans)',
                fontSize: '16px',
                fontWeight: '700',
                color: 'var(--text)',
                marginBottom: '8px',
              }}>
                {item.title}
              </h3>
              <p style={{
                fontFamily: 'var(--mono)',
                fontSize: '12px',
                color: 'var(--text2)',
                lineHeight: '1.7',
                margin: 0,
              }}>
                {item.text}
              </p>
            </div>
          ))}
        </div>

        <a
          href="https://www.stelnadesigns.com/about"
          target="_blank"
          rel="noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '10px 18px',
            borderRadius: '8px',
            background: 'var(--amber)',
            color: '#fff',
            textDecoration: 'none',
            fontFamily: 'var(--sans)',
            fontSize: '13px',
            fontWeight: '700',
            letterSpacing: '0.4px',
          }}
        >
          View Full About Page ↗
        </a>
      </div>
      <Footer />
    </div>
  )

  const LandingPage = () => (
    <div style={{ padding: '36px 0 60px' }}>
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
      }}>
        <div style={{
          padding: '34px 28px 20px',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          background: 'linear-gradient(180deg, rgba(217,119,6,0.08) 0%, #fff 58%)',
          boxShadow: '0 6px 20px rgba(0,0,0,0.04)',
          textAlign: 'center',
          transition: 'transform 0.25s ease, box-shadow 0.25s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow = '0 12px 26px rgba(0,0,0,0.07)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.04)'
        }}
        >
          <h1 style={{
            fontFamily: "'Poppins', var(--sans)",
            fontSize: 'clamp(28px, 3.8vw, 44px)',
            fontWeight: '700',
            letterSpacing: '-0.4px',
            lineHeight: '1.15',
            color: 'var(--text)',
            marginTop: '18px',
            marginBottom: '18px',
            maxWidth: '760px',
            marginLeft: 'auto',
            marginRight: 'auto',
            animation: 'fadeUp 420ms ease both',
          }}>
            Upload <RotatingWord /> images. Get Manufacturability Analysis in <br /> <span style={{ color: 'var(--amber)' }}>4 Hours.</span>
          </h1>

          <p style={{
            fontFamily: 'Caveat, cursive',
            fontSize: '24px',
            fontWeight: '700',
            color: 'var(--text)',
            marginTop: '12px',
            marginBottom: '24px',
            textAlign: 'center',
            animation: 'fadeUp 450ms ease both',
            animationDelay: '60ms',
          }}>
            Your Partner from Insight to <span style={{ color: 'var(--amber)' }}>Manufacturing.</span>
          </p>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2px',
          }}>
            <button
            onClick={openWhatsApp}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px 20px',
              fontFamily: 'var(--sans)',
              fontSize: '12px',
              fontWeight: '600',
              letterSpacing: '0.2px',
              border: '2px solid #d0d0d0',
              borderRadius: '24px',
              background: '#fff',
              color: '#1a1a1a',
              cursor: 'pointer',
              animation: 'buttonPop 0.35s ease-out both',
              animationDelay: '80ms',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px) scale(1.05)'
              e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 0, 0, 0.2)'
              e.currentTarget.style.background = '#f5f5f5'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)'
              e.currentTarget.style.boxShadow = '0 2px 12px rgba(0, 0, 0, 0.08)'
              e.currentTarget.style.background = '#fff'
            }}
          >
            <img
              src="/WHATSAPP.png"
              alt="WhatsApp"
              style={{
                height: '24px',
                width: '24px',
                objectFit: 'contain',
                display: 'block',
                flexShrink: 0,
                borderRadius: '50%',
              }}
            />
            <span>Send Photo on WhatsApp</span>
            <span>→</span>
          </button>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: '12px',
            marginTop: '12px',
            justifyContent: 'center',
          }}>
            <a
            href="tel:+919110440617"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontFamily: 'var(--sans)',
              fontSize: '13px',
              fontWeight: '600',
              color: 'var(--text2)',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              padding: '4px 6px',
              borderRadius: '4px',
              opacity: 0.8,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--amber)'
              e.currentTarget.style.backgroundColor = '#f5f5f5'
              e.currentTarget.style.transform = 'translateY(-1px)'
              e.currentTarget.style.opacity = '1'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text2)'
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.opacity = '0.8'
            }}
          >
            <span style={{ filter: 'hue-rotate(220deg)' }}>📞</span>
            <span>+91 9110 440617</span>
          </a>

          <span style={{ color: '#d0d0d0', opacity: 0.8 }}>•</span>

          <a
            href="mailto:pilot@bhuve.com"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontFamily: 'var(--sans)',
              fontSize: '13px',
              fontWeight: '600',
              color: 'var(--text2)',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              padding: '4px 6px',
              borderRadius: '4px',
              opacity: 0.8,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--amber)'
              e.currentTarget.style.backgroundColor = '#f5f5f5'
              e.currentTarget.style.transform = 'translateY(-1px)'
              e.currentTarget.style.opacity = '1'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text2)'
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.opacity = '0.8'
            }}
          >
            <span style={{ filter: 'hue-rotate(220deg)' }}>✉</span>
            <span>pilot@bhuve.com</span>
          </a>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          marginTop: '14px',
        }}>
          {[
            { t: 'Just send a photo', d: 'Photo from different angle will be helpful, Include a ruler for scale if possible.' },
            { t: 'Fast turnaround', d: 'We respond within 4 hours\n(business hours).' },
            { t: 'Actionable outcome', d: 'Manufacturability, Design, Simulation needs & Tentative Pricing.' },
          ].map((card, index) => (
            <div key={card.t}>
              <div
              style={{
                padding: '16px 16px 14px',
                border: '1px solid #e6e6e6',
                borderRadius: '14px',
                background: '#fbfbfb',
                boxShadow: 'none',
                animation: 'fadeUp 520ms ease both',
                animationDelay: `${220 + (index * 70)}ms`,
                transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
                cursor: 'pointer',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)'
                e.currentTarget.style.borderColor = '#d9d9d9'
                e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.08)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.borderColor = '#e6e6e6'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <div style={{ fontFamily: 'var(--sans)', fontWeight: '700', fontSize: '18px', color: 'var(--text)', marginBottom: '8px' }}>{card.t}</div>
              <div style={{ fontFamily: 'var(--sans)', fontSize: '13px', color: '#8a8a8a', lineHeight: '1.7', whiteSpace: 'pre-line' }}>{card.d}</div>
              {index < 2 && (
                <div style={{
                  position: 'absolute',
                  right: '-22px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '18px',
                  color: '#d0d0d0',
                  animation: 'fadeUp 520ms ease both',
                  animationDelay: `${220 + (index * 70) + 35}ms`,
                }}>
                  →
                </div>
              )}
            </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  )

  const ContactPage = () => {
    const [contactForm, setContactForm] = useState({
      firstName: '',
      lastName: '',
      email: '',
      company: '',
      inquiry: '',
      agreeToEmails: false,
    })
    const [contactLoading, setContactLoading] = useState(false)
    const [contactMessage, setContactMessage] = useState(null)

    const handleContactChange = (e) => {
      const { name, value, type, checked } = e.target
      setContactForm(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }))
    }

    const handleContactSubmit = async (e) => {
      e.preventDefault()
      setContactLoading(true)
      setContactMessage(null)

      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/forms/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            formType: 'contact',
            payload: contactForm
          })
        })

        if (!response.ok) {
          const contentType = response.headers.get('content-type') || ''
          if (contentType.includes('application/json')) {
            const error = await response.json()
            throw new Error(error.error || 'Failed to submit form')
          }

          const text = await response.text()
          throw new Error(text || `Failed to submit form (HTTP ${response.status})`)
        }

        setContactMessage({ type: 'success', text: 'Thank you for your inquiry! We will get back to you soon.' })
        setContactForm({
          firstName: '',
          lastName: '',
          email: '',
          company: '',
          inquiry: '',
          agreeToEmails: false,
        })
      } catch (err) {
        setContactMessage({ type: 'error', text: err.message || 'Failed to submit form. Please try again.' })
      } finally {
        setContactLoading(false)
      }
    }

    const labelStyle = {
      fontSize: '12px',
      fontWeight: '600',
      color: '#374151',
      marginBottom: '6px',
      display: 'block',
      letterSpacing: '0.3px',
      fontFamily: 'var(--sans)',
    }

    const inputStyle = {
      width: '100%',
      padding: '14px 16px',
      borderRadius: '10px',
      border: '1px solid #e5e7eb',
      background: '#ffffff',
      fontSize: '14px',
      transition: 'all 0.2s ease',
      outline: 'none',
      boxSizing: 'border-box',
      fontFamily: 'var(--sans)',
      color: 'var(--text)',
    }

    const handleFieldFocus = (e) => {
      e.target.style.borderColor = '#1e6bb3'
      e.target.style.boxShadow = '0 0 0 3px rgba(30,107,179,0.1)'
    }

    const handleFieldBlur = (e) => {
      e.target.style.borderColor = '#e5e7eb'
      e.target.style.boxShadow = 'none'
    }

    return (
      <div style={{ maxWidth: '640px', margin: '24px auto', animation: 'fadeUp 420ms ease both' }}>
        <div style={{
          padding: '12px 20px',
          borderRadius: '16px',
          background: 'linear-gradient(180deg, rgba(30,107,179,0.035) 0%, rgba(30,107,179,0.01) 40%, #fff 100%)',
          border: '1px solid #e5e7eb',
          textAlign: 'center',
          marginBottom: '14px',
          animation: 'fadeUp 520ms ease both',
        }}>
          <h1 style={{ fontFamily: 'var(--sans)', fontSize: '32px', fontWeight: '700', marginBottom: '8px', color: 'var(--text)' }}>
            Contact
          </h1>
          <p style={{ fontFamily: 'var(--sans)', fontSize: '14px', color: 'var(--text3)', lineHeight: '1.7', marginBottom: '4px', opacity: 0.8 }}>
            Plan a demo or request more information on our services.
          </p>
          <p style={{ fontFamily: 'var(--sans)', fontSize: '13px', color: 'var(--text3)', lineHeight: '1.6', marginBottom: '0', opacity: 0.8 }}>
            Fill in the form below and we will get back to you.
          </p>
        </div>

        {contactMessage && (
          <div style={{
            padding: '14px 16px',
            marginBottom: '24px',
            borderRadius: '10px',
            background: contactMessage.type === 'success' ? 'rgba(34, 197, 94, 0.05)' : 'rgba(239, 68, 68, 0.05)',
            border: `1px solid ${contactMessage.type === 'success' ? '#22c55e' : '#ef4444'}`,
            color: contactMessage.type === 'success' ? '#15803d' : '#991b1b',
            fontFamily: 'var(--sans)',
            fontSize: '13px',
            lineHeight: '1.6',
            animation: 'fadeUp 360ms ease both',
          }}>
            {contactMessage.text}
          </div>
        )}

        <form
          onSubmit={handleContactSubmit}
          style={{
            padding: '24px',
            borderRadius: '16px',
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
            animation: 'fadeUp 560ms ease both',
          }}
        >
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
            marginBottom: '20px',
          }}>
            <div>
              <label style={labelStyle}>First Name</label>
              <input
                type="text"
                name="firstName"
                value={contactForm.firstName}
                onChange={handleContactChange}
                required
                placeholder="Enter your first name"
                style={inputStyle}
                onFocus={handleFieldFocus}
                onBlur={handleFieldBlur}
              />
            </div>
            <div>
              <label style={labelStyle}>Last Name</label>
              <input
                type="text"
                name="lastName"
                value={contactForm.lastName}
                onChange={handleContactChange}
                required
                placeholder="Enter your last name"
                style={inputStyle}
                onFocus={handleFieldFocus}
                onBlur={handleFieldBlur}
              />
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Your Email Address</label>
            <input
              type="email"
              name="email"
              value={contactForm.email}
              onChange={handleContactChange}
              required
              placeholder="your.email@example.com"
              style={inputStyle}
              onFocus={handleFieldFocus}
              onBlur={handleFieldBlur}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Your Company Name<span style={{ color: 'var(--red)' }}>*</span></label>
            <input
              type="text"
              name="company"
              value={contactForm.company}
              onChange={handleContactChange}
              required
              placeholder="Enter your company name"
              style={inputStyle}
              onFocus={handleFieldFocus}
              onBlur={handleFieldBlur}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Tell us more about your inquiry.<span style={{ color: 'var(--red)' }}>*</span></label>
            <textarea
              name="inquiry"
              value={contactForm.inquiry}
              onChange={handleContactChange}
              required
              placeholder="Please describe your inquiry or request..."
              style={{
                ...inputStyle,
                minHeight: '120px',
                resize: 'vertical',
              }}
              onFocus={handleFieldFocus}
              onBlur={handleFieldBlur}
            />
          </div>

          <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <input
              type="checkbox"
              name="agreeToEmails"
              id="agreeToEmails"
              checked={contactForm.agreeToEmails}
              onChange={handleContactChange}
              style={{
                marginTop: '4px',
                cursor: 'pointer',
                width: '18px',
                height: '18px',
              }}
            />
            <label
              htmlFor="agreeToEmails"
              style={{
                fontFamily: 'var(--sans)',
                fontSize: '13px',
                color: 'var(--text2)',
                lineHeight: '1.7',
                cursor: 'pointer',
              }}
            >
              I agree to receive emails and/or SMS text messages regarding my inquiry, and I understand I can opt out of these communications at any time.
            </label>
          </div>

          <button
            type="submit"
            disabled={contactLoading}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '10px',
              background: contactLoading ? '#bfc7d2' : 'linear-gradient(135deg, #1e6bb3, #2c88d9)',
              color: '#fff',
              border: 'none',
              fontWeight: '600',
              fontSize: '14px',
              cursor: contactLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              marginTop: '10px',
              fontFamily: 'var(--sans)',
            }}
            onMouseEnter={(e) => {
              if (!contactLoading) {
                e.target.style.transform = 'translateY(-1px)'
                e.target.style.boxShadow = '0 10px 20px rgba(30,107,179,0.2)'
              }
            }}
            onMouseLeave={(e) => {
              if (!contactLoading) {
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = 'none'
              }
            }}
          >
            {contactLoading ? 'Submitting...' : 'Submit'}
          </button>
        </form>
        <Footer />
      </div>
    )
  }

  const CaseStudiesPage = () => (
    <div style={{ padding: '60px 0', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'var(--sans)', fontSize: '36px', fontWeight: '700', marginBottom: '20px', color: 'var(--text)', textAlign: 'center' }}>
        Case Studies
      </h1>
      <p style={{ fontFamily: 'var(--mono)', fontSize: '14px', color: 'var(--text2)', lineHeight: '1.8', marginBottom: '40px', textAlign: 'center' }}>
        Explore how organizations have successfully used BHUVE to streamline their workflows.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        {[
          {
            title: 'Aerospace Manufacturing',
            description: 'Reduced design time by 40% using BHUVE to source and manage engineering components.',
            company: 'TechAero Solutions'
          },
          {
            title: 'Product Prototyping',
            description: 'Accelerated prototype development cycle by centralizing CAD model access across teams.',
            company: 'InnovateTech Labs'
          },
          {
            title: 'Educational Institution',
            description: 'Enhanced engineering curriculum with comprehensive CAD library access for students.',
            company: 'University of Design'
          }
        ].map((study, i) => (
          <div
            key={i}
            style={{
              padding: '24px',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              background: 'var(--bg2)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--amber)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(217,119,6,0.1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <h3 style={{ fontFamily: 'var(--sans)', fontSize: '18px', fontWeight: '600', color: 'var(--text)', marginBottom: '12px' }}>
              {study.title}
            </h3>
            <p style={{ fontFamily: 'var(--mono)', fontSize: '13px', color: 'var(--text2)', lineHeight: '1.6', marginBottom: '16px' }}>
              {study.description}
            </p>
            <p style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--amber)', fontWeight: '600', letterSpacing: '0.5px' }}>
              — {study.company}
            </p>
          </div>
        ))}
      </div>
      <Footer />
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', position: 'relative', zIndex: 1 }}>
      {/* Navigation Bar */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 24px',
        background: 'var(--bg)',
        borderBottom: '1px solid var(--border)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }} onClick={() => window.location.hash = 'home'}>
          <img
            src="/bhuveblue.png"
            alt="BHUVE"
            style={{
              height: '56px',
              width: '56px',
              objectFit: 'contain',
              display: 'block',
            }}
          />
          <span style={{
            fontFamily: 'var(--sans)',
            fontSize: '18px',
            fontWeight: '800',
            letterSpacing: '-0.5px',
            color: '#000',
          }}>
            BHUVE
          </span>
        </div>

        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          {[
            { label: 'Home', page: 'home' },
            { label: 'Search Parts', page: 'search' },
            { label: 'Case Studies', page: 'case-studies' },
            { label: 'About', page: 'about', externalUrl: 'https://www.stelnadesigns.com/about' }
          ].map(item => (
            <button
              key={item.page}
              onClick={() => {
                if (item.externalUrl) {
                  window.open(item.externalUrl, '_blank')
                  return
                }
                window.location.hash = item.page
              }}
              style={{
                background: 'none',
                border: 'none',
                fontFamily: 'var(--sans)',
                fontSize: '13px',
                color: currentPage === item.page ? 'var(--amber)' : 'var(--text2)',
                cursor: 'pointer',
                letterSpacing: '0.2px',
                padding: '6px 10px',
                transition: 'color 0.2s ease, border-color 0.2s ease',
                fontWeight: '600',
                borderBottom: `2px solid ${currentPage === item.page ? 'var(--amber)' : 'transparent'}`,
              }}
              onMouseEnter={(e) => {
                if (currentPage !== item.page) {
                  e.currentTarget.style.color = 'var(--amber)'
                }
              }}
              onMouseLeave={(e) => {
                if (currentPage !== item.page) {
                  e.currentTarget.style.color = 'var(--text2)'
                }
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

      </nav>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 clamp(12px, 3vw, 24px)', position: 'relative', zIndex: 1, background: 'var(--bg)' }}>

        {currentPage === 'home' && <LandingPage />}

        {currentPage === 'search' && (
          <>
            <section style={{
              padding: '48px 0 34px',
              borderBottom: 'none',
              background: 'linear-gradient(180deg, rgba(30,107,179,0.035) 0%, rgba(30,107,179,0.01) 40%, transparent 100%)',
              animation: 'searchSectionIn 420ms ease both',
            }}>
              <div style={{ maxWidth: '980px' }}>
              <h1 className="hero-headline" style={{
                fontFamily: 'var(--sans)',
                fontSize: 'clamp(32px, 5vw, 52px)',
                fontWeight: '700',
                lineHeight: '1.05',
                letterSpacing: '-2px',
                marginBottom: '12px',
                color: 'var(--text)',
                animation: 'fadeUp 460ms ease both',
              }}>
                <div>One search.</div>
                <div><span style={{ color: 'var(--amber)' }}>Every 3D CAD library.</span></div>
              </h1>

              <p style={{
                fontFamily: 'var(--sans)',
                fontSize: '15px',
                fontWeight: '400',
                color: 'var(--text2)',
                lineHeight: '1.65',
                marginBottom: '30px',
                maxWidth: '680px',
                animation: 'fadeUp 520ms ease both',
                animationDelay: '80ms',
              }}>
                STL, STEP, OBJ, FBX, BLEND — from engineering parts to printable collectibles.
              </p>
              </div>

              <div style={{ animation: 'fadeUp 560ms ease both', animationDelay: '120ms' }}>
                <SearchBar onSearch={handleSearch} loading={loading} />
              </div>

              <div className="sites-strip-wrapper" style={{
                marginTop: '24px',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                overflow: 'auto',
                WebkitOverflowScrolling: 'touch',
                background: '#fff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                animation: 'fadeUp 620ms ease both',
                animationDelay: '180ms',
              }}>
                <div style={{
                  display: 'flex',
                  minWidth: '340px',
                  width: '100%',
                }}>
                  {SITES.map((s, idx) => (
                    <div key={s} style={{
                      flex: '1 0 140px',
                      padding: '10px 14px',
                      textAlign: 'center',
                      fontFamily: 'var(--sans)',
                      fontSize: '11px',
                      color: 'var(--text2)',
                      fontWeight: '500',
                      letterSpacing: '0.1px',
                      borderRight: '1px solid var(--border)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      animation: 'fadeUp 420ms ease both',
                      animationDelay: `${260 + (idx * 70)}ms`,
                    }}>
                      {s}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {error && (
              <div style={{
                marginTop: '24px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                padding: '12px 16px',
                fontFamily: 'var(--mono)',
                fontSize: '12px',
                color: 'var(--red)',
              }}>
                ⚠ {error}
              </div>
            )}

            {loading && results.length === 0 && (
              <div style={{ marginTop: '28px' }}>
                <LoadingGrid />
              </div>
            )}

            {loading && results.length > 0 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '16px 0 0',
                fontFamily: 'var(--mono)',
                fontSize: '12px',
                color: 'var(--amber)',
                animation: 'fadeUp 300ms ease both',
              }}>
                <span style={{
                  width: '6px', height: '6px',
                  borderRadius: '50%',
                  background: 'var(--amber)',
                  flexShrink: 0,
                  animation: 'pulse 1s ease-in-out infinite',
                }} />
                Querying all sources in parallel
              </div>
            )}

            {searched && results.length > 0 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '20px 0 0',
                flexWrap: 'wrap',
                animation: 'fadeUp 320ms ease both',
              }}>
                <span style={{
                  fontFamily: 'var(--mono)',
                  fontSize: '11px',
                  color: 'var(--text3)',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                }}>
                  Filter:
                </span>
                {['ALL', 'STL', 'STEP', 'OBJ', 'FBX', 'BLEND'].map((ft, idx) => (
                  <button
                    key={ft}
                    onClick={() => setFileFilter(ft)}
                    style={{
                      fontFamily: 'var(--sans)',
                      fontSize: '12px',
                      padding: '7px 14px',
                      border: `1px solid ${fileFilter === ft ? 'var(--amber)' : 'var(--border)'}`,
                      background: fileFilter === ft ? 'var(--amber-light)' : '#fff',
                      color: fileFilter === ft ? 'var(--amber)' : 'var(--text2)',
                      borderRadius: '999px',
                      cursor: 'pointer',
                      letterSpacing: '0.2px',
                      transition: 'all 0.2s ease',
                      fontWeight: fileFilter === ft ? '600' : '400',
                      animation: 'filterChipIn 280ms ease both',
                      animationDelay: `${idx * 40}ms`,
                    }}
                    onMouseEnter={(e) => {
                      if (fileFilter !== ft) {
                        e.currentTarget.style.borderColor = 'var(--amber-border)'
                        e.currentTarget.style.color = 'var(--amber)'
                        e.currentTarget.style.transform = 'translateY(-1px)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (fileFilter !== ft) {
                        e.currentTarget.style.borderColor = 'var(--border)'
                        e.currentTarget.style.color = 'var(--text2)'
                        e.currentTarget.style.transform = 'translateY(0)'
                      }
                    }}
                  >
                    {ft}
                  </button>
                ))}
              </div>
            )}

            {searched && !error && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '14px 0 18px',
                borderBottom: '1px solid var(--border)',
                marginTop: '10px',
                marginBottom: '24px',
                fontFamily: 'var(--sans)',
                fontSize: '13px',
                color: 'var(--text3)',
                lineHeight: '1.4',
                animation: 'fadeUp 320ms ease both',
              }}>
                <span style={{
                  width: '6px', height: '6px',
                  borderRadius: '50%',
                  background: loading ? 'var(--amber)' : 'var(--green)',
                  flexShrink: 0,
                }} />
                <span>
                  <span style={{ color: 'var(--amber)', fontWeight: '600' }}>{results.length}</span> models found
                </span>
                <span>·</span>
                <span style={{ color: 'var(--text2)' }}>"{query}"</span>
              </div>
            )}

            {searched && results.length > 0 && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: '18px',
                paddingBottom: '56px',
              }}>
                {results
                  .slice()
                  .sort((a, b) => (b.downloads || 0) - (a.downloads || 0))
                  .filter(result => {
                    if (fileFilter === 'ALL') return true
                    const normalize = (value = '') => value.toString().trim().toLowerCase()
                    const text = ((result.title || '') + ' ' + (result.description || '')).toLowerCase()
                    const extensionAliases = {
                      STL: ['stl'],
                      STEP: ['step', 'stp', 'p21'],
                      OBJ: ['obj', '3dm'],
                      FBX: ['fbx'],
                      BLEND: ['blend'],
                      IGES: ['iges', 'igs'],
                    }

                    const normalizedFromPayload = Array.isArray(result.fileTypes)
                      ? result.fileTypes.map(normalize)
                      : []

                    const detectedFromText = Object.entries(extensionAliases)
                      .filter(([, aliases]) => aliases.some(alias => text.includes(alias)))
                      .map(([key]) => key.toLowerCase())

                    const typeSet = new Set([...normalizedFromPayload, ...detectedFromText])
                    return typeSet.has(fileFilter.toLowerCase())
                  })
                  .map((result, i) => (
                    <ResultCard key={result.url || i} result={result} index={i} />
                  ))
                }
              </div>
            )}

            {searched && !loading && results.length === 0 && !error && (
              <div style={{ textAlign: 'center', padding: '80px 0' }}>
                <div style={{
                  width: '56px', height: '56px',
                  border: '1.5px solid var(--border)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="11" cy="11" r="7" stroke="var(--text3)" strokeWidth="1.5" />
                    <path d="M16 16L20 20" stroke="var(--text3)" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M8 11H14" stroke="var(--text3)" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
                <h3 style={{
                  fontFamily: 'var(--sans)',
                  fontSize: '18px',
                  fontWeight: '600',
                  color: 'var(--text)',
                  marginBottom: '8px',
                }}>
                  No CAD models found
                </h3>
                <p style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--text3)' }}>
                  Try keywords like "gear", "bracket", "shaft", "housing"
                </p>
              </div>
            )}

            <footer style={{
              padding: '24px 0',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              fontFamily: 'var(--sans)',
              fontSize: '12px',
              fontWeight: '500',
              color: 'var(--text2)',
              letterSpacing: '0.2px',
              marginTop: '20px',
            }}>
              <span>Bhuve.com © owned by Stelna Designs LLP</span>
            </footer>
          </>
        )}

        {currentPage === 'manufacture' && <ManufacturePage />}
        {currentPage === 'case-studies' && <CaseStudiesPage />}
        {currentPage === 'about' && <LearnMorePage />}
        {/* {currentPage === 'contact' && <ContactPage />} */}

      </div>
      <style>{`
        @media (max-width: 768px) {
          nav {
            padding: 12px 16px !important;
          }
          nav > div:last-child {
            gap: 12px !important;
            flex-wrap: wrap !important;
          }
          nav button {
            font-size: 12px !important;
            padding: 4px 8px !important;
          }
        }

        @media (max-width: 640px) {
          nav > div:last-child {
            gap: 8px !important;
          }
          nav button {
            font-size: 11px !important;
            padding: 4px 6px !important;
          }
        }

        @media (max-width: 480px) {
          .hero-headline {
            font-size: 28px !important;
            letter-spacing: -0.5px !important;
          }
          .footer {
            flex-direction: column !important;
            gap: 8px !important;
            align-items: flex-start !important;
          }
          .sites-strip-wrapper > div {
            min-width: 320px !important;
          }
          nav > div:first-child {
            flex: 1 !important;
          }
          nav > div:last-child {
            flex: 1 !important;
            gap: 6px !important;
            justify-content: center !important;
          }
          nav button {
            font-size: 10px !important;
            padding: 3px 4px !important;
            white-space: nowrap !important;
          }
        }

        @media (max-width: 380px) {
          nav > div:last-child {
            display: grid !important;
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 6px !important;
          }
          nav button {
            font-size: 10px !important;
            padding: 6px 8px !important;
          }
        }
      `}</style>
    </div>
  )
}
