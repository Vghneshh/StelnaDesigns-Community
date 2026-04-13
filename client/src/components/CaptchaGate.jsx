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
      setError('Verification failed. Please try again.')
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
        setError(data.error || 'Verification failed. Please try again.')
      }
    } catch (err) {
      setError('Could not verify. Please check your connection.')
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
      background: 'linear-gradient(135deg, #f8f9fa 0%, #f0f2f5 100%)',
      padding: '16px',
      fontFamily: 'var(--sans)',
    }}>
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }

        .captcha-container {
          animation: slideUp 0.6s ease-out;
        }
      `}</style>

      <div className="captcha-container" style={{
        maxWidth: '480px',
        width: '100%',
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e8eaed',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
        padding: '56px 40px',
        textAlign: 'center',
      }}>
        {/* Icon */}
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '14px',
          background: 'linear-gradient(135deg, #d9775600 0%, #d979060f 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '28px',
          marginLeft: 'auto',
          marginRight: 'auto',
          fontSize: '32px',
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth="1.5">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="var(--amber)" />
          </svg>
        </div>

        {/* Heading */}
        <h1 style={{
          fontSize: '28px',
          fontWeight: '700',
          color: '#1a1a1a',
          marginBottom: '12px',
          letterSpacing: '-0.5px',
        }}>
          Verify Your Access
        </h1>

        {/* Subheading */}
        <p style={{
          fontSize: '14px',
          color: '#5f6368',
          lineHeight: '1.6',
          marginBottom: '36px',
          fontWeight: '400',
        }}>
          Complete the security check below to continue browsing our CAD library.
        </p>

        {/* Error Message */}
        {error && (
          <div style={{
            background: 'linear-gradient(135deg, #fef2f2 0%, #fde8e8 100%)',
            border: '1px solid #fecaca',
            borderRadius: '10px',
            padding: '12px 14px',
            marginBottom: '24px',
            color: '#991b1b',
            fontSize: '13px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        {/* CAPTCHA Widget */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '24px',
          opacity: loading ? 0.6 : 1,
          pointerEvents: loading ? 'none' : 'auto',
          transition: 'opacity 0.3s ease',
        }}>
          <ReCAPTCHA
            sitekey={import.meta.env.VITE_RECAPTCHA_SITEKEY}
            onChange={handleCaptchaChange}
            theme="light"
          />
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontSize: '13px',
            color: 'var(--amber)',
            fontWeight: '500',
          }}>
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: 'var(--amber)',
              animation: 'pulse 1.4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }} />
            Verifying...
          </div>
        )}

        {/* Footer Text */}
        <p style={{
          fontSize: '12px',
          color: '#9aa0a6',
          marginTop: '32px',
          paddingTop: '20px',
          borderTop: '1px solid #e8eaed',
        }}>
          This site is protected by reCAPTCHA and the Google{' '}
          <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer" style={{ color: '#4285f4', textDecoration: 'none', fontWeight: '500' }}>
            Privacy Policy
          </a>
          {' '}and{' '}
          <a href="https://policies.google.com/terms" target="_blank" rel="noreferrer" style={{ color: '#4285f4', textDecoration: 'none', fontWeight: '500' }}>
            Terms of Service
          </a>
          {' '}apply.
        </p>
      </div>
    </div>
  )
}
