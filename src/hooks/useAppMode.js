import { useState, useEffect } from 'react'
import { checkStandalone } from '../utils/standalone'

/**
 * Hook phát hiện ứng dụng đang chạy ở chế độ App (standalone display-mode)
 * Expose: { isApp: boolean }
 * Thêm / xóa class 'app-mode' vào thẻ <body> để can thiệp layout (ẩn nav-links, padding-bottom cho tab...)
 */
export function useAppMode() {
  const [isApp, setIsApp] = useState(() => checkStandalone())

  useEffect(() => {
    const updateAppMode = () => {
      const standalone = checkStandalone()
      setIsApp(standalone)
      if (standalone) {
        document.body.classList.add('app-mode')
      } else {
        document.body.classList.remove('app-mode')
      }
    }

    updateAppMode()

    const mediaQuery = window.matchMedia ? window.matchMedia('(display-mode: standalone)') : null
    const handleChange = () => updateAppMode()

    if (mediaQuery?.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
    } else if (mediaQuery?.addListener) {
      mediaQuery.addListener(handleChange)
    }

    return () => {
      if (mediaQuery?.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange)
      } else if (mediaQuery?.removeListener) {
        mediaQuery.removeListener(handleChange)
      }
      document.body.classList.remove('app-mode')
    }
  }, [])

  return { isApp }
}
