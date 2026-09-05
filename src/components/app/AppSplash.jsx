import { useState, useEffect, useRef } from 'react'
import { useAppMode } from '../../hooks/useAppMode'

/**
 * Màn hình Splash xuất hiện thoáng qua khi mở PWA ở chế độ Standalone (App Mode)
 * Tự động biến mất sau ~900ms hoặc khi window load (điều kiện nào tới trước)
 * Sử dụng logo-splash.webp siêu nhẹ (2.6KB so với logo.png 447KB) giúp khởi động tức thì
 */
export default function AppSplash() {
  const { isApp } = useAppMode()
  const [visible, setVisible] = useState(() => isApp)
  const [fading, setFading] = useState(false)
  const hasExited = useRef(false)

  useEffect(() => {
    if (!isApp) return

    let timerFade = null
    let timerRemove = null

    const startExit = () => {
      // Guard: Chỉ thực hiện 1 lần duy nhất để tránh đua giữa timer 900ms và sự kiện window load
      if (hasExited.current) return
      hasExited.current = true

      setFading(true)
      timerRemove = setTimeout(() => {
        setVisible(false)
      }, 400) // Khớp thời gian animation CSS
    }

    // Thời gian hiển thị splash tối đa ~900ms
    timerFade = setTimeout(startExit, 900)

    const handleLoad = () => {
      // Nếu trang nạp xong nhanh, chờ tối thiểu 400ms rồi đóng
      setTimeout(startExit, 400)
    }

    if (document.readyState === 'complete') {
      // Nếu đã load xong từ trước, để timerFade đảm nhiệm
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
        <img
          src="/logo-splash.webp"
          onError={(e) => { e.currentTarget.src = '/logo.png' }}
          alt="Chiếu Nẫu Logo"
          className="app-splash-logo"
          width="96"
          height="96"
        />
        <h1 className="app-splash-title">Chiếu Nẫu</h1>
        <p className="app-splash-tagline">Gìn Nghề — Giữ Sinh Kế</p>
      </div>
    </div>
  )
}
