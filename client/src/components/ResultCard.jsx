import { useState } from 'react'

function PlaceholderImage() {
  return (
    <div style={{
      width: '100%',
      height: '160px',
      background: 'var(--bg3)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <rect x="4" y="4" width="32" height="32" rx="3" stroke="#d97706" strokeWidth="1.5" strokeDasharray="4 2"/>
        <path d="M14 20L20 14L26 20" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M20 14V28" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    </div>
  )
}

const FILE_TYPES = ['stl', 'step', 'stp', 'obj', 'fbx', 'blend', 'iges', 'igs']

function detectFileTypes(title = '', description = '') {
  const text = (title + ' ' + description).toLowerCase()
  return FILE_TYPES.filter(ft => text.includes(ft)).map(ft => ft.toUpperCase()).slice(0, 3)
}

export default function ResultCard({ result, index }) {
  const [imgError, setImgError] = useState(false)
  const [hovered, setHovered] = useState(false)

  const fileTypes = detectFileTypes(result.title, result.description)

  return (
    <a
      href={result.url}
      target="_blank"
      rel="noreferrer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#fff',
        border: `1px solid ${hovered ? 'var(--amber)' : 'var(--border)'}`,
        borderRadius: '10px',
        overflow: 'hidden',
        textDecoration: 'none',
        color: 'inherit',
        display: 'flex',
        flexDirection: 'column',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: hovered ? '0 8px 24px rgba(217,119,6,0.1)' : '0 1px 4px rgba(0,0,0,0.04)',
        transition: 'all 0.2s',
        animation: `fadeUp 0.35s ease ${index * 0.05}s both`,
      }}
    >
      {/* Image */}
      {result.imageUrl && !imgError ? (
        <img
          src={result.imageUrl}
          alt={result.title}
          onError={() => setImgError(true)}
          style={{
            width: '100%',
            height: '160px',
            objectFit: 'cover',
            borderBottom: '1px solid var(--border)',
            display: 'block',
          }}
        />
      ) : (
        <PlaceholderImage />
      )}

      {/* Body */}
      <div style={{
        padding: '14px',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}>

        {/* Source */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            fontSize: '10px',
            color: 'var(--amber)',
            fontFamily: 'var(--mono)',
            letterSpacing: '1px',
            textTransform: 'uppercase',
          }}>
            <span style={{
              width: '5px', height: '5px',
              background: 'var(--amber)',
              borderRadius: '50%',
            }}/>
            {result.source}
          </div>

          {/* File type badges */}
          {fileTypes.length > 0 && (
            <div style={{ display: 'flex', gap: '3px' }}>
              {fileTypes.map(ft => (
                <span key={ft} style={{
                  fontFamily: 'var(--mono)',
                  fontSize: '8px',
                  padding: '2px 5px',
                  border: '1px solid var(--amber-border)',
                  color: 'var(--amber)',
                  background: 'var(--amber-light)',
                  fontWeight: '600',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                  borderRadius: '3px',
                }}>
                  {ft}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Title */}
        <div style={{
          fontFamily: 'var(--sans)',
          fontSize: '14px',
          fontWeight: '600',
          color: 'var(--text)',
          lineHeight: '1.4',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {result.title}
        </div>

        {/* Description */}
        <div style={{
          fontFamily: 'var(--mono)',
          fontSize: '11px',
          color: 'var(--text2)',
          lineHeight: '1.7',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          flex: 1,
        }}>
          {result.description}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 14px',
        borderTop: '1px solid var(--border)',
        background: 'var(--bg2)',
      }}>
        <span style={{
          fontFamily: 'var(--mono)',
          fontSize: '10px',
          color: 'var(--text3)',
        }}>
          {result.downloads > 0 ? `↓ ${result.downloads.toLocaleString()}` : result.source + '/...'}
        </span>
        <span style={{
          fontFamily: 'var(--mono)',
          fontSize: '10px',
          color: 'var(--amber)',
          whiteSpace: 'nowrap',
          fontWeight: '500',
        }}>
          open ↗
        </span>
      </div>
    </a>
  )
}