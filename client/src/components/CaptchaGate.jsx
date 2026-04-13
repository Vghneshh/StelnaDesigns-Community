import { useState, useEffect } from 'react'
import ReCAPTCHA from 'react-google-recaptcha'

export default function CaptchaGate({ children }) {
  const [verified, setVerified] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Check if already verified in this session
  useEffect(() => {
    const isVerified = sessionStorage.getItem('captcha_verified')
    if (isVerified === 'true') {
      setVerified(true)
    }
  }, [])

  const handleCaptchaChange = async (token) => {
    if (!token) {
      setError('CAPTCHA verification failed. Please try again.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '')
      const response = await fetch(`${API_BASE}/api/verify-captcha`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      })

      const data = await response.json()

      if (data.success) {
        sessionStorage.setItem('captcha_verified', 'true')
        setVerified(true)
      } else {
        setError(data.error || 'CAPTCHA verification failed. Please try again.')
      }
    } catch (err) {
      setError('Could not verify CAPTCHA. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (verified) {
    return children
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'var(--bg)',
      padding: '24px',
    }}>
      <div style={{
        textAlign: 'center',
        maxWidth: '400px',
        width: '100%',
        background: '#fff',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '40px 32px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
      }}>
        <div style={{
          fontSize: '32px',
          marginBottom: '16px',
        }}>
          🔐
        </div>

        <h1 style={{
          fontFamily: 'var(--sans)',
          fontSize: '24px',
          fontWeight: '700',
          color: 'var(--text)',
          marginBottom: '12px',
        }}>
          Security Check
        </h1>

        <p style={{
          fontFamily: 'var(--sans)',
          fontSize: '14px',
          color: 'var(--text2)',
          lineHeight: '1.6',
          marginBottom: '32px',
        }}>
          Please verify you're human to continue.
        </p>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.05)',
            border: '1px solid #ef4444',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '20px',
            color: '#991b1b',
            fontFamily: 'var(--mono)',
            fontSize: '12px',
          }}>
            {error}
          </div>
        )}

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '16px',
          opacity: loading ? 0.5 : 1,
          pointerEvents: loading ? 'none' : 'auto',
        }}>
          <ReCAPTCHA
            sitekey={import.meta.env.VITE_RECAPTCHA_SITEKEY}
            onChange={handleCaptchaChange}
            theme="light"
          />
        </div>

        {loading && (
          <div style={{
            fontFamily: 'var(--mono)',
            fontSize: '12px',
            color: 'var(--amber)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginTop: '16px',
          }}>
            <span style={{
              width: '6px', height: '6px',
              borderRadius: '50%',
              background: 'var(--amber)',
              animation: 'pulse 1s ease-in-out infinite',
            }} />
            Verifying...
          </div>
        )}
      </div>
    </div>
  )
}
