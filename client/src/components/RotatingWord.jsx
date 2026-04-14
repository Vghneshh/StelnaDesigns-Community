import { useEffect, useState } from 'react'

export default function RotatingWord() {
  const words = ['spare parts', 'components', 'broken parts']
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex(prev => (prev + 1) % words.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <span className="flip-container">
      <span className="flip-word">
        {words[index]}
      </span>
    </span>
  )
}
