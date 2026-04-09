export default function Navbar({ currentPage, onNavigate }) {
  const pages = [
    { id: 'home', label: 'Home' },
    { id: 'product-readiness', label: 'Product Readiness' },
    { id: 'manufacture', label: 'Manufacture' },
    { id: 'custom-design', label: 'Custom Design' },
    { id: 'webinars', label: 'Webinars' },
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
          fontFamily: 'var(--mono)',
          fontSize: '16px',
          fontWeight: '600',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          color: 'var(--text)',
          cursor: 'pointer',
        }}
        onClick={() => onNavigate('home')}
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
              fontFamily: 'var(--mono)',
              fontSize: '12px',
              color: currentPage === page.id ? 'var(--amber)' : 'var(--text2)',
              cursor: 'pointer',
              letterSpacing: '0.5px',
              padding: '4px 8px',
              borderBottom: currentPage === page.id ? '2px solid var(--amber)' : 'none',
              transition: 'all 0.2s',
              fontWeight: currentPage === page.id ? '600' : '400',
            }}
          >
            {page.label}
          </button>
        ))}
      </div>

      {/* Version */}
      <span style={{
        fontFamily: 'var(--mono)',
        fontSize: '10px',
        color: 'var(--text3)',
        letterSpacing: '1px',
      }}>
        v0.1.0
      </span>
    </nav>
  )
}
