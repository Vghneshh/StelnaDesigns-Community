import { useState, useRef } from 'react'
import ReCAPTCHA from 'react-google-recaptcha'

const HINTS = ['motor assembly', 'spur gear', 'robotic arm', 'ball bearing', 'heat sink', 'Enclosure']

export default function SearchBar({ onSearch, loading }) {
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const [showCaptcha, setShowCaptcha] = useState(false)
  const [captchaToken, setCaptchaToken] = useState(null)
  const recaptchaRef = useRef(null)

  function handleSearch() {
    if (query.trim() && !loading) {
      // Show CAPTCHA if not already verified
      if (!captchaToken) {
        setShowCaptcha(true)
        return
      }
      // Token exists, proceed with search
      performSearch()
    }
  }

  function performSearch() {
    if (captchaToken) {
      onSearch(query.trim(), captchaToken)
      setCaptchaToken(null)
      setShowCaptcha(false)
      recaptchaRef.current?.reset()
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter') handleSearch()
  }

  function handleHint(hint) {
    setQuery(hint)
    // Reset CAPTCHA for new search
    setCaptchaToken(null)
    setShowCaptcha(false)
    recaptchaRef.current?.reset()
  }

  function handleCaptchaChange(token) {
    setCaptchaToken(token)
    if (token) {
      // Auto-search when CAPTCHA is completed
      performSearch()
    }
  }

  return (
    <div style={{ maxWidth: 'clamp(300px, 90%, 700px)', margin: '0 auto' }}>
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Search bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        background: '#fff',
        border: `1.5px solid ${focused ? 'var(--amber)' : 'var(--border)'}`,
        borderRadius: '12px',
        padding: '8px 10px 8px 12px',
        marginBottom: '12px',
        transition: 'all 0.2s ease',
        boxShadow: focused ? '0 0 0 4px var(--amber-dim), 0 8px 20px rgba(0,0,0,0.05)' : '0 2px 8px rgba(0,0,0,0.04)',
      }}>

        {/* Search icon */}
        <span style={{ color: 'var(--text3)', flexShrink: 0, display: 'flex' }}>
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <circle cx="8.5" cy="8.5" r="6.5" stroke="currentColor" strokeWidth="1.6" />
            <path d="M14 14L17.5 17.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </span>

        {/* Input */}
        <input
          type="text"
          list="empty-datalist"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKey}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Search CAD models, parts, assemblies..."
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            background: 'transparent',
            fontFamily: 'var(--sans)',
            fontSize: '14px',
            lineHeight: '1.4',
            color: 'var(--text)',
          }}
        />

        <button
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          style={{
            border: '1px solid transparent',
            borderRadius: '10px',
            background: loading || !query.trim() ? 'var(--bg3)' : 'var(--amber)',
            color: loading || !query.trim() ? 'var(--text3)' : '#fff',
            fontFamily: 'var(--sans)',
            fontSize: '12px',
            fontWeight: '600',
            padding: '8px 12px',
            cursor: loading || !query.trim() ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={(e) => {
            if (!loading && query.trim()) {
              e.currentTarget.style.filter = 'brightness(0.95)'
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.filter = 'brightness(1)'
          }}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {/* CAPTCHA Modal - Only show when explicitly triggered by search click */}
      {showCaptcha && (
        <div style={{
          background: '#fff',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '12px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
          animation: 'slideDown 0.3s ease',
        }}>
          <p style={{
            fontSize: '13px',
            color: 'var(--text2)',
            margin: '0 0 8px 0',
            fontFamily: 'var(--sans)',
          }}>
            Verify you're human to search
          </p>
          <ReCAPTCHA
            ref={recaptchaRef}
            sitekey={import.meta.env.VITE_RECAPTCHA_SITEKEY}
            onChange={handleCaptchaChange}
            theme="light"
          />
        </div>
      )}

      {/* Hint chips */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {HINTS.map(hint => (
          <button
            key={hint}
            onClick={() => handleHint(hint)}
            style={{
              background: '#fff',
              border: '1px solid var(--border)',
              borderRadius: '999px',
              padding: '6px 13px',
              fontSize: '12px',
              fontWeight: '500',
              color: 'var(--text2)',
              cursor: 'pointer',
              fontFamily: 'var(--sans)',
              lineHeight: '1.3',
              transition: 'all 0.18s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--amber)'
              e.currentTarget.style.color = 'var(--amber)'
              e.currentTarget.style.background = 'var(--amber-light)'
              e.currentTarget.style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border)'
              e.currentTarget.style.color = 'var(--text2)'
              e.currentTarget.style.background = '#fff'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            {hint}
          </button>
        ))}
      </div>

      {/* Empty datalist to prevent browser autocomplete */}
      <datalist id="empty-datalist"></datalist>
    </div>
  )
}
