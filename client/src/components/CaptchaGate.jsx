import { useState, useEffect } from 'react'
import ReCAPTCHA from 'react-google-recaptcha'

export default function CaptchaGate({ children }) {
  const [verified, setVerified] = useState(false)
  const [loading, setLoading] = useState(false)

  // Check if already verified in this session
  useEffect(() => {
    const isVerified = sessionStorage.getItem('captcha_verified')
    if (isVerified === 'true') {
      setVerified(true)
    }
  }, [])

  const handleCaptchaChange = async (token) => {
    if (!token) return

    setLoading(true)

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
      }
    } catch (err) {
      console.error('CAPTCHA verification failed:', err)
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
      background: '#fff',
      padding: '20px',
    }}>
      <div style={{ opacity: loading ? 0.5 : 1, pointerEvents: loading ? 'none' : 'auto' }}>
        <ReCAPTCHA
          sitekey={import.meta.env.VITE_RECAPTCHA_SITEKEY}
          onChange={handleCaptchaChange}
          theme="light"
        />
      </div>
    </div>
  )
}
