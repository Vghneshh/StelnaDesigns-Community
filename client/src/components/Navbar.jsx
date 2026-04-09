export default function Navbar({ currentPage, onNavigate }) {
  const pages = [
    { id: 'home', label: 'Home' },
    { id: 'search', label: 'Search Parts' },
    { id: 'manufacture', label: 'Manufacture' },
    { id: 'case-studies', label: 'Case Studies' },
    { id: 'about', label: 'About' },
    { id: 'contact', label: 'Contact' },
  ]

  return (
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

      {/* Nav links */}
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
  )
}
