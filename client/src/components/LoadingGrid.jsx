function SkeletonCard({ delay = 0 }) {
  const shimmer = {
    background: 'linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)',
    backgroundSize: '600px 100%',
    animation: `shimmer 1.4s ease-in-out ${delay}s infinite`,
  }

  return (
    <div style={{
      background: '#fff',
      border: '1px solid var(--border)',
      borderRadius: '10px',
      overflow: 'hidden',
      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    }}>
      {/* Image skeleton */}
      <div style={{ height: '160px', ...shimmer }}/>

      {/* Body skeleton */}
      <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {/* Source line */}
        <div style={{ height: '8px', width: '30%', borderRadius: '4px', ...shimmer }}/>
        {/* Title line */}
        <div style={{ height: '14px', width: '85%', borderRadius: '4px', ...shimmer }}/>
        {/* Title line 2 */}
        <div style={{ height: '14px', width: '60%', borderRadius: '4px', ...shimmer }}/>
        {/* Desc lines */}
        <div style={{ height: '10px', width: '100%', borderRadius: '4px', ...shimmer }}/>
        <div style={{ height: '10px', width: '90%', borderRadius: '4px', ...shimmer }}/>
        <div style={{ height: '10px', width: '70%', borderRadius: '4px', ...shimmer }}/>
      </div>

      {/* Footer skeleton */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 14px',
        borderTop: '1px solid var(--border)',
        background: 'var(--bg2)',
      }}>
        <div style={{ height: '8px', width: '80px', borderRadius: '4px', ...shimmer }}/>
        <div style={{ height: '8px', width: '40px', borderRadius: '4px', ...shimmer }}/>
      </div>
    </div>
  )
}

export default function LoadingGrid() {
  return (
    <div>
      {/* Status text */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 0',
        borderBottom: '1px solid var(--border)',
        marginBottom: '20px',
        fontFamily: 'var(--mono)',
        fontSize: '11px',
        color: 'var(--text3)',
      }}>
        <span style={{
          width: '6px', height: '6px',
          borderRadius: '50%',
          background: 'var(--amber)',
          animation: 'pulse 1s ease-in-out infinite',
          flexShrink: 0,
        }}/>
        Searching 7 CAD sources in parallel
        <span style={{ color: 'var(--amber)', animation: 'pulse 1s step-end infinite' }}>_</span>
      </div>

      {/* Skeleton cards grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: '16px',
      }}>
        <SkeletonCard delay={0} />
        <SkeletonCard delay={0.1} />
        <SkeletonCard delay={0.2} />
        <SkeletonCard delay={0.3} />
        <SkeletonCard delay={0.4} />
        <SkeletonCard delay={0.5} />
      </div>
    </div>
  )
}