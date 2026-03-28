import { useState, useRef } from 'react'
import SearchBar from './components/SearchBar'
import ResultCard from './components/ResultCard'
import LoadingGrid from './components/LoadingGrid'

const SITES = ['Thingiverse', 'Cults3D', 'MyMiniFactory', 'CGTrader', 'Sketchfab']

export default function App() {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [query, setQuery] = useState('')
  const [time, setTime] = useState(0)
  const [error, setError] = useState(null)
  const [fileFilter, setFileFilter] = useState('ALL')
  const [sortBy, setSortBy] = useState('downloads')
  const esRef = useRef(null)

  function handleSearch(q) {
    // Close any existing stream
    if (esRef.current) {
      esRef.current.close()
      esRef.current = null
    }

    setLoading(true)
    setResults([])
    setFileFilter('ALL')
    setSortBy('downloads')
    setSearched(false)
    setError(null)
    setQuery(q)
    const start = Date.now()

    const es = new EventSource(`${import.meta.env.VITE_API_URL}/api/search/stream?q=${encodeURIComponent(q)}`)
    esRef.current = es

    es.onmessage = (e) => {
      const data = JSON.parse(e.data)

      if (data.done) {
        es.close()
        esRef.current = null
        setLoading(false)
        setSearched(true)
        setTime(((Date.now() - start) / 1000).toFixed(2))
        return
      }

      if (data.results && data.results.length > 0) {
        setSearched(true)
        setResults(prev => {
          const seen = new Set(prev.map(r => r.url))
          const newOnes = data.results.filter(r => r.url && !seen.has(r.url))
          return [...prev, ...newOnes]
        })
      }
    }

    es.onerror = () => {
      es.close()
      esRef.current = null
      setLoading(false)
      setSearched(true)
      setError('Could not reach the server. Make sure the backend is running.')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', position: 'relative', zIndex: 1 }}>
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1, background: 'var(--bg)' }}>

        {/* Header */}
        <header style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 0',
          borderBottom: '2px solid var(--text)',
        }}>
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
            }}>
              CAD<span style={{ color: 'var(--amber)' }}>Search</span>
            </span>
          </div>
          <span style={{
            fontFamily: 'var(--mono)',
            fontSize: '10px',
            color: 'var(--text3)',
            letterSpacing: '1px',
          }}>
            7 SOURCES // v0.1.0
          </span>
        </header>

        {/* Hero */}
        <section style={{ padding: '52px 0 40px', borderBottom: '1px solid var(--border)' }}>
          <div style={{
            fontFamily: 'var(--mono)',
            fontSize: '10px',
            color: 'var(--amber)',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            marginBottom: '14px',
          }}>
            // engineering model search
          </div>

          <h1 style={{
            fontFamily: 'var(--sans)',
            fontSize: 'clamp(32px, 5vw, 52px)',
            fontWeight: '700',
            lineHeight: '1.05',
            letterSpacing: '-2px',
            marginBottom: '12px',
            color: 'var(--text)',
          }}>
            One search.<br />
            <span style={{ color: 'var(--amber)' }}>Every</span> CAD library.
          </h1>

          <p style={{
            fontFamily: 'var(--mono)',
            fontSize: '12px',
            color: 'var(--text2)',
            lineHeight: '1.8',
            marginBottom: '36px',
            maxWidth: '460px',
          }}>
            Real models only — STL, STEP, OBJ, FBX.<br />
            7 sources. Parallel searching. Zero noise.
          </p>

          <SearchBar onSearch={handleSearch} loading={loading} />

          {/* Sites strip */}
          <div style={{
            display: 'flex',
            marginTop: '28px',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            overflow: 'hidden',
          }}>
            {SITES.map(s => (
              <div key={s} style={{
                flex: 1,
                padding: '7px 4px',
                textAlign: 'center',
                fontFamily: 'var(--mono)',
                fontSize: '9px',
                color: 'var(--text3)',
                letterSpacing: '0.3px',
                borderRight: '1px solid var(--border)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {s}
              </div>
            ))}
          </div>
        </section>

        {/* Error */}
        {error && (
          <div style={{
            marginTop: '24px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            padding: '12px 16px',
            fontFamily: 'var(--mono)',
            fontSize: '12px',
            color: 'var(--red)',
          }}>
            ⚠ {error}
          </div>
        )}

        {/* Loading skeleton — only show if no results yet */}
        {loading && results.length === 0 && (
          <div style={{ marginTop: '28px' }}>
            <LoadingGrid />
          </div>
        )}

        {/* "Searching more..." indicator while streaming but results already showing */}
        {loading && results.length > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 0 0',
            fontFamily: 'var(--mono)',
            fontSize: '11px',
            color: 'var(--amber)',
          }}>
            <span style={{
              width: '6px', height: '6px',
              borderRadius: '50%',
              background: 'var(--amber)',
              flexShrink: 0,
              animation: 'pulse 1s ease-in-out infinite',
            }} />
            Searching more sources...
          </div>
        )}

        {/* File type filter */}
        {searched && results.length > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '16px 0 0',
            flexWrap: 'wrap',
          }}>
            <span style={{
              fontFamily: 'var(--mono)',
              fontSize: '10px',
              color: 'var(--text3)',
              letterSpacing: '1px',
              textTransform: 'uppercase',
            }}>
              Filter:
            </span>
            {['ALL', 'STL', 'STEP', 'OBJ', 'FBX'].map(ft => (
              <button
                key={ft}
                onClick={() => setFileFilter(ft)}
                style={{
                  fontFamily: 'var(--mono)',
                  fontSize: '10px',
                  padding: '4px 12px',
                  border: `1px solid ${fileFilter === ft ? 'var(--amber)' : 'var(--border)'}`,
                  background: fileFilter === ft ? 'var(--amber-light)' : 'var(--bg2)',
                  color: fileFilter === ft ? 'var(--amber)' : 'var(--text3)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  letterSpacing: '1px',
                  transition: 'all 0.15s',
                  fontWeight: fileFilter === ft ? '600' : '400',
                }}
              >
                {ft}
              </button>
            ))}
          </div>
        )}

        {/* Status bar */}
        {searched && !error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '14px 0',
            borderBottom: '1px solid var(--border)',
            marginTop: '8px',
            marginBottom: '24px',
            fontFamily: 'var(--mono)',
            fontSize: '11px',
            color: 'var(--text3)',
          }}>
            <span style={{
              width: '6px', height: '6px',
              borderRadius: '50%',
              background: loading ? 'var(--amber)' : 'var(--green)',
              flexShrink: 0,
            }} />
            <span>
              <span style={{ color: 'var(--amber)', fontWeight: '600' }}>{results.length}</span> models found
            </span>
            {!loading && (
              <>
                <span>·</span>
                <span>
                  <span style={{ color: 'var(--green)', fontWeight: '600' }}>{time}s</span> search time
                </span>
              </>
            )}
            <span>·</span>
            <span style={{ color: 'var(--text2)' }}>"{query}"</span>
          </div>
        )}

        {/* Results grid — shows while still loading */}
        {searched && results.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '16px',
            paddingBottom: '60px',
          }}>
            {results
              .slice()
              .sort((a, b) => (b.downloads || 0) - (a.downloads || 0))
              .filter(result => {
                if (fileFilter === 'ALL') return true
                // Always check both fileTypes and text fallback
                const hasType = result.fileTypes && result.fileTypes.includes(fileFilter)
                const text = ((result.title || '') + ' ' + (result.description || '')).toLowerCase()
                const extensionMap = {
                  'STL': ['stl'],
                  'STEP': ['step', 'stp', 'iges', 'igs', 'p21', 'solidworks', 'catia', 'fusion', 'creo'],
                  'OBJ': ['obj', '3dm'],
                  'FBX': ['fbx', 'blend'],
                }
                const extensions = extensionMap[fileFilter] || [fileFilter.toLowerCase()]
                const hasText = extensions.some(ext => text.includes(ext))
                return hasType || hasText
              })
              .map((result, i) => (
                <ResultCard key={result.url || i} result={result} index={i} />
              ))
            }
          </div>
        )}

        {/* Empty state */}
        {searched && !loading && results.length === 0 && !error && (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{
              width: '56px', height: '56px',
              border: '1.5px solid var(--border)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="7" stroke="var(--text3)" strokeWidth="1.5" />
                <path d="M16 16L20 20" stroke="var(--text3)" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M8 11H14" stroke="var(--text3)" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <h3 style={{
              fontFamily: 'var(--sans)',
              fontSize: '18px',
              fontWeight: '600',
              color: 'var(--text)',
              marginBottom: '8px',
            }}>
              No CAD models found
            </h3>
            <p style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--text3)' }}>
              Try keywords like "gear", "bracket", "shaft", "housing"
            </p>
          </div>
        )}

        {/* Footer */}
        <footer style={{
          padding: '24px 0',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          fontFamily: 'var(--mono)',
          fontSize: '10px',
          color: 'var(--text3)',
          letterSpacing: '0.5px',
          marginTop: '20px',
        }}>
          <span>CADSearch // engineering model search</span>
          <span>STL · STEP · OBJ · FBX</span>
        </footer>

      </div>
    </div>
  )
}
