import { useState, useEffect, useRef } from 'react'
import ReCAPTCHA from 'react-google-recaptcha'

export default function CaptchaModal({ onSuccess, onClose, sessionId }) {
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const captchaRef = useRef(null)

  const handleCaptchaChange = (value) => {
    setToken(value)
    setError(null)
  }

  // Auto-verify when token is received
  useEffect(() => {
    if (token) {
      handleVerifyAndRetry(token)
    }
  }, [token])

  async function handleVerifyAndRetry(tokenToVerify) {
    const verifyToken = tokenToVerify || token

    if (!verifyToken) {
      setError('Please complete the CAPTCHA verification.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '')
      const response = await fetch(`${API_BASE}/api/verify-captcha-and-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: verifyToken, sessionId }),
      })

      const data = await response.json()

      if (data.success && data.rateLimitReset) {
        // CAPTCHA verified and rate limit reset
        setLoading(false)
        // Add small delay to ensure state settles before calling onSuccess
        setTimeout(() => {
          onSuccess()
        }, 300)
      } else {
        setLoading(false)
        setError(data.error || 'CAPTCHA verification failed. Please try again.')
        // Reset CAPTCHA on verification failure
        if (captchaRef.current) {
          captchaRef.current.reset()
          setToken(null)
        }
      }
    } catch (err) {
      setLoading(false)
      setError('Network error. Please try again.')
      if (captchaRef.current) {
        captchaRef.current.reset()
        setToken(null)
      }
    }
  }

  const RECAPTCHA_SITEKEY = import.meta.env.VITE_RECAPTCHA_SITEKEY

  // Main render
  return (
    <div style={overlayStyles}>
      <div style={modalStyles}>
        {/* Title */}
        <h2 style={titleStyles}>
          Verify You're Human
        </h2>

        {/* Description */}
        <p style={descriptionStyles}>
          You've made several searches. Please complete the CAPTCHA below to continue searching.
        </p>

        {/* CAPTCHA Widget */}
        {RECAPTCHA_SITEKEY && (
          <div style={captchaContainerStyles}>
            <ReCAPTCHA
              ref={captchaRef}
              sitekey={RECAPTCHA_SITEKEY}
              onChange={handleCaptchaChange}
              theme="light"
            />
          </div>
        )}

        {!RECAPTCHA_SITEKEY && (
          <div style={warningStyles}>
            ⚠ reCAPTCHA not configured. Check VITE_RECAPTCHA_SITEKEY environment variable.
          </div>
        )}

        {/* Error message */}
        {error && (
          <div style={errorStyles}>
            ⚠ {error}
          </div>
        )}

        {/* Loading indicator */}
        {loading && (
          <div style={loadingStyles}>
            <div style={spinnerStyles}></div>
            <p style={{ margin: '8px 0 0 0', color: '#525252', fontSize: '14px' }}>
              Verifying...
            </p>
          </div>
        )}

        {/* Buttons */}
        {!loading && (
          <div style={buttonContainerStyles}>
            <button
              onClick={onClose}
              style={cancelButtonStyles}
              onMouseEnter={(e) => {
                e.target.style.background = '#efefef'
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#f5f5f5'
              }}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              onClick={() => handleVerifyAndRetry(token)}
              style={submitButtonStyles(loading)}
              onMouseEnter={(e) => {
                if (!loading) e.target.style.background = '#154a8a'
              }}
              onMouseLeave={(e) => {
                if (!loading) e.target.style.background = '#1e6bb3'
              }}
              disabled={loading || !token}
            >
              {loading ? 'Verifying...' : 'Continue Searching'}
            </button>
          </div>
        )}

        {/* Keyframe animations */}
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideUp {
            from { transform: translate(-50%, calc(-50% + 20px)); opacity: 0; }
            to { transform: translate(-50%, -50%); opacity: 1; }
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          [data-captcha-overlay] {
            animation: fadeIn 0.3s ease-in-out;
          }
          [data-captcha-modal] {
            animation: slideUp 0.3s ease-in-out;
          }
        `}</style>
      </div>
    </div>
  )
}

// ============================================
// STYLE DEFINITIONS
// ============================================

const overlayStyles = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  'data-captcha-overlay': true,
}

const modalStyles = {
  background: 'white',
  borderRadius: '12px',
  padding: '32px',
  maxWidth: '420px',
  width: '90%',
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  'data-captcha-modal': true,
}

const titleStyles = {
  fontSize: '20px',
  fontWeight: '700',
  color: '#0a0a0a',
  marginBottom: '8px',
  marginTop: 0,
}

const descriptionStyles = {
  fontSize: '14px',
  color: '#525252',
  lineHeight: '1.6',
  margin: '0 0 20px 0',
}

const captchaContainerStyles = {
  marginBottom: '20px',
  display: 'flex',
  justifyContent: 'center',
}

const warningStyles = {
  background: '#fef2f2',
  border: '1px solid #fecaca',
  borderRadius: '8px',
  padding: '12px 16px',
  marginBottom: '20px',
  fontSize: '12px',
  color: '#dc2626',
  fontFamily: 'monospace',
}

const errorStyles = {
  background: '#fef2f2',
  border: '1px solid #fecaca',
  borderRadius: '8px',
  padding: '12px 16px',
  marginBottom: '16px',
  fontSize: '12px',
  color: '#dc2626',
  fontFamily: 'monospace',
}

const loadingStyles = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '24px 0',
  marginBottom: '16px',
}

const spinnerStyles = {
  width: '24px',
  height: '24px',
  border: '3px solid #e5e5e5',
  borderTop: '3px solid #1e6bb3',
  borderRadius: '50%',
  animation: 'spin 0.8s linear infinite',
}

const buttonContainerStyles = {
  display: 'flex',
  gap: '12px',
  marginTop: '24px',
}

const cancelButtonStyles = {
  flex: 1,
  padding: '10px 16px',
  background: '#f5f5f5',
  border: '1px solid #e5e5e5',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '600',
  color: '#525252',
  transition: 'all 0.2s ease',
  fontFamily: 'system-ui, -apple-system, sans-serif',
}

const submitButtonStyles = (loading) => ({
  flex: 1,
  padding: '10px 16px',
  background: '#1e6bb3',
  border: 'none',
  borderRadius: '6px',
  cursor: loading ? 'not-allowed' : 'pointer',
  fontSize: '14px',
  fontWeight: '600',
  color: 'white',
  transition: 'all 0.2s ease',
  opacity: loading ? 0.7 : 1,
  fontFamily: 'system-ui, -apple-system, sans-serif',
})