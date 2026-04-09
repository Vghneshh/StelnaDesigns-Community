import { useState } from 'react'

const HINTS = ['motor assembly', 'spur gear', 'robotic arm', 'ball bearing', 'heat sink', 'Enclosure']

export default function SearchBar({ onSearch, loading }) {
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)

  function handleSearch() {
    if (query.trim() && !loading) onSearch(query.trim())
  }

  function handleKey(e) {
    if (e.key === 'Enter') handleSearch()
  }

  function handleHint(hint) {
    setQuery(hint)
    onSearch(hint)
  }

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto' }}>

      {/* Search bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        background: focused ? '#fff' : 'var(--bg3)',
        border: `1.5px solid ${focused ? 'var(--amber)' : 'transparent'}`,
        borderRadius: '12px',
        padding: '12px 18px',
        marginBottom: '12px',
        transition: 'all 0.2s',
        boxShadow: focused ? '0 0 0 3px var(--amber-dim)' : 'none',
      }}>

        {/* Search icon */}
        <span style={{ color: 'var(--text3)', flexShrink: 0, display: 'flex' }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="7.5" cy="7.5" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M13 13L16 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
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
            fontSize: '15px',
            color: 'var(--text)',
          }}
        />

        {/* Enter hint or loading */}
        {loading ? (
          <span style={{
            fontFamily: 'var(--mono)',
            fontSize: '10px',
            color: 'var(--amber)',
            flexShrink: 0,
            animation: 'pulse 1s ease-in-out infinite',
          }}>
            searching...
          </span>
        ) : (
          <span style={{
            fontFamily: 'var(--mono)',
            fontSize: '10px',
            color: 'var(--text3)',
            border: '1px solid var(--border)',
            borderRadius: '4px',
            padding: '2px 6px',
            flexShrink: 0,
            whiteSpace: 'nowrap',
          }}>
            ↵ enter
          </span>
        )}
      </div>

      {/* Hint chips */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {HINTS.map(hint => (
          <button
            key={hint}
            onClick={() => handleHint(hint)}
            style={{
              background: 'var(--bg2)',
              border: '1px solid var(--border)',
              borderRadius: '20px',
              padding: '5px 14px',
              fontSize: '12px',
              color: 'var(--text2)',
              cursor: 'pointer',
              fontFamily: 'var(--mono)',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--amber)'
              e.currentTarget.style.color = 'var(--amber)'
              e.currentTarget.style.background = 'var(--amber-light)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border)'
              e.currentTarget.style.color = 'var(--text2)'
              e.currentTarget.style.background = 'var(--bg2)'
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