import { useState, useEffect } from 'react'
import { useAppMode } from '../../hooks/useAppMode'

/**
 * Màn hình Splash xuất hiện thoáng qua khi mở PWA ở chế độ Standalone (App Mode)
 * Tự động biến mất sau ~900ms hoặc khi window load (điều kiện nào tới trước)
 */
export default function AppSplash() {
  const { isApp } = useAppMode()
  const [visible, setVisible] = useState(() => isApp)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    if (!isApp) return

    let timerFade = null
    let timerRemove = null

    const startExit = () => {
      setFading(true)
      timerRemove = setTimeout(() => {
        setVisible(false)
      }, 400) // Khớp thời gian animation CSS
    }

    // Thời gian hiển thị splash ~900ms
    timerFade = setTimeout(startExit, 900)

    const handleLoad = () => {
      // Nếu trang nạp xong nhanh, chờ tối thiểu 400ms rồi đóng
      setTimeout(startExit, 400)
    }

    if (document.readyState === 'complete') {
      // Đã nạp xong
    } else {
      window.addEventListener('load', handleLoad, { once: true })
    }

    return () => {
      clearTimeout(timerFade)
      clearTimeout(timerRemove)
      window.removeEventListener('load', handleLoad)
    }
  }, [isApp])

  if (!isApp || !visible) return null

  return (
    <div className={`app-splash-overlay ${fading ? 'fading' : ''}`} aria-hidden="true">
      <div className="app-splash-content">
        <img src="/logo.png" alt="Chiếu Nẫu Logo" className="app-splash-logo" />
        <h1 className="app-splash-title">Chiếu Nẫu</h1>
        <p className="app-splash-tagline">Gìn Nghề — Giữ Sinh Kế</p>
      </div>
    </div>
  )
}
