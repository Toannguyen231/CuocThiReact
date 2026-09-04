import { useState, useEffect } from 'react'

/**
 * Custom hook quản lý sự kiện cài đặt PWA (beforeinstallprompt)
 * Expose:
 * - canInstall: boolean (có thể hiển thị prompt cài đặt)
 * - promptInstall: hàm trigger pop-up cài đặt chuẩn của trình duyệt
 * - isInstalled: boolean (đã cài đặt ứng dụng)
 */
export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Kiểm tra nếu đã chạy trong chế độ standalone (đã cài đặt)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
    if (isStandalone) {
      setIsInstalled(true)
    }

    const handleBeforeInstallPrompt = (e) => {
      // Ngăn chặn thanh cài đặt mặc định trên một số thiết bị cũ
      e.preventDefault()
      // Lưu lại event để kích hoạt khi người dùng bấm nút
      setDeferredPrompt(e)
    }

    const handleAppInstalled = () => {
      // Khi ứng dụng đã cài đặt thành công
      setDeferredPrompt(null)
      setIsInstalled(true)
      console.log('Chiếu Nẫu PWA đã được cài đặt thành công!')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const promptInstall = async () => {
    if (!deferredPrompt) return false
    // Hiển thị prompt trình duyệt
    deferredPrompt.prompt()
    // Chờ kết quả người dùng chọn (accepted / dismissed)
    const { outcome } = await deferredPrompt.userChoice
    setDeferredPrompt(null)
    return outcome === 'accepted'
  }

  return {
    canInstall: !!deferredPrompt && !isInstalled,
    promptInstall,
    isInstalled
  }
}
