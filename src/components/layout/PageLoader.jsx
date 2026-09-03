import { useState, useEffect } from 'react'

export default function PageLoader() {
  const [loaded, setLoaded] = useState(false)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 600)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!loaded) return
    const timer = setTimeout(() => setVisible(false), 700)
    return () => clearTimeout(timer)
  }, [loaded])

  if (!visible) return null

  return (
    <div className={`page-loader ${loaded ? 'loaded' : ''}`}>
      <div className="loader-content">
        <img src="/logo.png" alt="Chiếu Nẫu Logo" style={{ width: '76px', height: '76px', borderRadius: '50%', objectFit: 'contain', background: '#fff', padding: '4px', margin: '0 auto 0.75rem', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', display: 'block' }} />
        <div className="loader-logo">Chiếu Nẫu</div>
        <div className="loader-bar"></div>
      </div>
    </div>
  )
}
