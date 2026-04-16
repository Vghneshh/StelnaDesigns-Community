import { useState, useEffect, useRef } from 'react'
import ReCAPTCHA from 'react-google-recaptcha'

export default function CaptchaModal({ onSuccess, sessionId }) {
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
        onSuccess()
      } else {
        setLoading(false)
        setError(data.error || 'CAPTCHA verification failed. Please try again.')
        return (
          <>
            <div className="captcha-modal-overlay">
              <div className="captcha-modal">
                {/* Close button removed to enforce CAPTCHA completion */}
                <h2>Verify You're Human</h2>
                <p>You've made several searches. Please complete the CAPTCHA below to continue searching.</p>
                <div style={{ margin: '18px 0' }}>
                  <ReCAPTCHA
                    ref={captchaRef}
                    sitekey={import.meta.env.VITE_RECAPTCHA_SITEKEY}
                    onChange={handleCaptchaChange}
                    theme="light"
                  />
                </div>
                {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                  <button onClick={() => handleVerifyAndRetry(token)} disabled={loading || !token} style={{ padding: '8px 18px', fontWeight: 600, borderRadius: 6, border: 'none', background: '#2563eb', color: '#fff', cursor: loading ? 'not-allowed' : 'pointer' }}>
                    {loading ? 'Verifying...' : 'Continue Searching'}
                  </button>
                </div>
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
                `}</style>
              </div>
            </div>
          </>
        )
        }}
      >
        {/* Close button */}
        return (
          <div className="captcha-modal-overlay">
            <div className="captcha-modal">
              {/* Close button removed to enforce CAPTCHA completion */}
              <h2>Verify You're Human</h2>
              <p>You've made several searches. Please complete the CAPTCHA below to continue searching.</p>
              <div style={{ margin: '18px 0' }}>
                <ReCAPTCHA
                  ref={captchaRef}
                  sitekey={import.meta.env.VITE_RECAPTCHA_SITEKEY}
                  onChange={handleCaptchaChange}
                  theme="light"
                />
              </div>
              {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button onClick={() => handleVerifyAndRetry(token)} disabled={loading || !token} style={{ padding: '8px 18px', fontWeight: 600, borderRadius: 6, border: 'none', background: '#2563eb', color: '#fff', cursor: loading ? 'not-allowed' : 'pointer' }}>
                  {loading ? 'Verifying...' : 'Continue Searching'}
                </button>
              </div>
            </div>
          </div>
        )
            fontSize: '20px',
            fontWeight: '700',
            color: '#0a0a0a',
            marginBottom: '8px',
            marginTop: 0,
          }}
        >
          Verify You're Human
        </h2>

        {/* Description */}
        <p
          style={{
            fontSize: '14px',
            color: '#525252',
            lineHeight: '1.6',
            marginBottom: '20px',
            margin: '0 0 20px 0',
          }}
        >
          You've made several searches. Please complete the CAPTCHA below to continue searching.
        </p>

        {/* CAPTCHA Widget */}
        {RECAPTCHA_SITEKEY && (
          <div
            style={{
              marginBottom: '20px',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <ReCAPTCHA
              ref={captchaRef}
              sitekey={RECAPTCHA_SITEKEY}
              onChange={handleCaptchaChange}
              theme="light"
            />
          </div>
        )}

        {!RECAPTCHA_SITEKEY && (
          <div
            style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '20px',
              fontSize: '12px',
              color: '#dc2626',
              fontFamily: 'var(--mono)',
            }}
          >
            ⚠ reCAPTCHA not configured. Check VITE_RECAPTCHA_SITEKEY environment variable.
          </div>
        )}

        {/* Error message */}
        {error && (
          <div
            style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '16px',
              fontSize: '12px',
              color: '#dc2626',
              fontFamily: 'var(--mono)',
            }}
          >
            ⚠ {error}
          </div>
        )}

        {/* Buttons */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            marginTop: '24px',
          }}
        >
          <button
            onClick={onClose}
            style={{
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
              fontFamily: 'var(--sans)',
            }}
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
            style={{
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
              fontFamily: 'var(--sans)',
            }}
            onMouseEnter={(e) => {
              if (!loading) e.target.style.background = '#154a8a'
            }}
            onMouseLeave={(e) => {
              if (!loading) e.target.style.background = '#1e6bb3'
            }}
            disabled={loading}
          >
            {loading ? 'Verifying...' : 'Continue Searching'}
          </button>
        </div>

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
        `}</style>
      </div>
    </>
  )
}
