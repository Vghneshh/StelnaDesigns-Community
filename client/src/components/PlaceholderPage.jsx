export default function PlaceholderPage({ title }) {
  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '40px 24px' }}>
      <h1 style={{ fontFamily: 'var(--sans)', fontSize: '32px', fontWeight: '700', marginBottom: '24px', color: 'var(--text)' }}>
        {title}
      </h1>
      <div style={{ fontFamily: 'var(--sans)', fontSize: '16px', color: 'var(--text2)', lineHeight: '1.8' }}>
        <p>{title} page content coming soon...</p>
      </div>
    </div>
  )
}
