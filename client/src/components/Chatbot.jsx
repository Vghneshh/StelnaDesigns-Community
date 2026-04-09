import { useState } from 'react'

export default function Chatbot() {
  const [messages, setMessages] = useState([
    { id: 1, type: 'bot', text: 'Hello! I am your Product Readiness Assistant. How can I help you today?' }
  ])
  const [input, setInput] = useState('')

  const handleSend = () => {
    if (!input.trim()) return

    setMessages([...messages, { id: messages.length + 1, type: 'user', text: input }])
    setInput('')

    setTimeout(() => {
      setMessages(prev => [...prev, { id: prev.length + 1, type: 'bot', text: 'Thanks for your message! This is a demo chatbot.' }])
    }, 500)
  }

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '40px 24px' }}>
      <h1 style={{ fontFamily: 'var(--sans)', fontSize: '32px', fontWeight: '700', marginBottom: '24px', color: 'var(--text)' }}>
        Product Readiness Chatbot
      </h1>

      <div style={{
        background: '#fff',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        height: '500px',
        overflow: 'hidden',
      }}>
        {/* Messages */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}>
          {messages.map(msg => (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              <div style={{
                background: msg.type === 'user' ? 'var(--amber)' : 'var(--bg2)',
                color: msg.type === 'user' ? '#fff' : 'var(--text)',
                padding: '12px 16px',
                borderRadius: '8px',
                maxWidth: '70%',
                fontFamily: 'var(--sans)',
                fontSize: '14px',
                lineHeight: '1.5',
              }}>
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div style={{
          padding: '16px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          gap: '8px',
        }}>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            style={{
              flex: 1,
              padding: '10px 14px',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              fontFamily: 'var(--sans)',
              fontSize: '14px',
              outline: 'none',
            }}
          />
          <button
            onClick={handleSend}
            style={{
              padding: '10px 20px',
              background: 'var(--amber)',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontFamily: 'var(--mono)',
              fontSize: '12px',
              fontWeight: '600',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => e.target.style.opacity = '0.9'}
            onMouseLeave={e => e.target.style.opacity = '1'}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
