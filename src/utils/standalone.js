/**
 * Hàm kiểm tra trình duyệt đang chạy ở chế độ standalone (app đã cài đặt)
 */
export function checkStandalone() {
  if (typeof window === 'undefined') return false
  const isMatchMedia = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches
  const isIosStandalone = window.navigator && window.navigator.standalone === true
  return Boolean(isMatchMedia || isIosStandalone)
}
