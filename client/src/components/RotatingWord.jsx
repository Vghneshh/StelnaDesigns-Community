import { useEffect, useState } from 'react'

export default function RotatingWord() {
  const words = ['spare parts', 'components', 'broken parts']
  const [index, setIndex] = useState(0)
  const [key, setKey] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex(prev => {
        const next = (prev + 1) % words.length
        setKey(k => k + 1) // Force animation retrigger
        return next
      })
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <span className="flip-container">
      <span key={key} className="flip-word">
        {words[index]}
      </span>
    </span>
  )
}
