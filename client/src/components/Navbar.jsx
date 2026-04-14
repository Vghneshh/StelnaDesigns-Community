import { useEffect, useState } from 'react'

export default function Navbar({ currentPage, onNavigate }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 900
      setIsMobile(mobile)
      if (!mobile) {
        setMobileMenuOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [mobileMenuOpen])

  const pages = [
    { id: 'home', label: 'Home' },
    { id: 'search', label: 'Search Parts' },
    { id: 'manufacture', label: 'Manufacture' },
    { id: 'case-studies', label: 'Case Studies' },
    { id: 'about', label: 'About' },
    { id: 'contact', label: 'Contact' },
  ]

  return (
    <>
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 24px',
        background: 'var(--bg)',
        borderBottom: '1px solid var(--border)',
        width: '100%',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', width: '22px' }}>
          {[100, 66, 33].map((w, i) => (
            <span key={i} style={{ display: 'block', height: '2px', width: `${w}%`, background: 'var(--amber)' }} />
          ))}
        </div>
        <span style={{
          fontFamily: 'Montserrat, var(--sans)',
          fontSize: '19px',
          fontWeight: '800',
          letterSpacing: '0.9px',
          textTransform: 'uppercase',
          color: '#0f172a',
          cursor: 'pointer',
          transition: 'transform 0.2s ease, color 0.2s ease, letter-spacing 0.2s ease',
        }}
        onClick={() => onNavigate('home')}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-1px)'
          e.currentTarget.style.color = '#0b1220'
          e.currentTarget.style.letterSpacing = '1.1px'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.color = '#0f172a'
          e.currentTarget.style.letterSpacing = '0.9px'
        }}
        >
          CAD<span style={{ color: 'var(--amber)' }}>Search</span>
        </span>
      </div>

      {/* Desktop links only */}
      {!isMobile && (
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          {pages.map(page => (
            <button
              key={page.id}
              onClick={() => onNavigate(page.id)}
              style={{
                background: 'none',
                border: 'none',
                fontFamily: 'Montserrat, var(--sans)',
                fontSize: '15px',
                color: currentPage === page.id ? '#0f172a' : '#475569',
                cursor: 'pointer',
                letterSpacing: '0',
                padding: '6px 11px',
                borderBottom: currentPage === page.id ? '2px solid #0f172a' : '2px solid transparent',
                transition: 'transform 0.2s ease, color 0.2s ease, border-color 0.2s ease, background-color 0.2s ease',
                fontWeight: currentPage === page.id ? '700' : '600',
                borderRadius: '999px',
              }}
              onMouseEnter={(e) => {
                if (currentPage !== page.id) {
                  e.currentTarget.style.color = '#0f172a'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                  e.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 0.05)'
                }
              }}
              onMouseLeave={(e) => {
                if (currentPage !== page.id) {
                  e.currentTarget.style.color = '#475569'
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.backgroundColor = 'transparent'
                }
              }}
            >
              {page.label}
            </button>
          ))}
        </div>
      )}

      {/* Burger button only on small screens */}
      {isMobile && (
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            color: '#0f172a',
            fontSize: '24px',
            lineHeight: 1,
            fontFamily: 'var(--sans)',
          }}
          aria-label="Toggle navigation menu"
        >
          ☰
        </button>
      )}

      {/* Version */}
      <span style={{
        fontFamily: 'Montserrat, var(--sans)',
        fontSize: '12px',
        color: '#64748b',
        letterSpacing: '1px',
      }}>
        v0.1.0
      </span>
      </nav>

      {isMobile && mobileMenuOpen && (
        <>
          <div
            onClick={() => setMobileMenuOpen(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.3)',
              zIndex: 50,
            }}
          />
          <div
            style={{
              position: 'relative',
              zIndex: 51,
              borderBottom: '1px solid var(--border)',
              background: 'var(--bg)',
              boxShadow: '0 6px 16px rgba(15, 23, 42, 0.08)',
              animation: 'slideDown 200ms ease',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {pages.map(page => (
                <button
                  key={page.id}
                  onClick={() => {
                    onNavigate(page.id)
                    setMobileMenuOpen(false)
                  }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    borderBottom: '1px solid var(--border)',
                    padding: '14px 24px',
                    fontFamily: 'Montserrat, var(--sans)',
                    fontSize: '14px',
                    fontWeight: currentPage === page.id ? '700' : '600',
                    color: currentPage === page.id ? '#0f172a' : '#475569',
                    cursor: 'pointer',
                  }}
                >
                  {page.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  )
}
