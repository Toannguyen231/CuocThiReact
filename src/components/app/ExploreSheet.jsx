import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

/**
 * Bottom-sheet Khám Phá dành riêng cho chế độ App (PWA Standalone)
 * Mở khi nhấn tab "Khám phá" trên BottomTabBar
 * Hiển thị 4 trang content đang bị ẩn trong App-mode:
 * 1. Câu chuyện (/cau-chuyen)
 * 2. Quà doanh nghiệp (/qua-tang-doanh-nghiep)
 * 3. Tác động xã hội (/tac-dong-xa-hoi)
 * 4. Cẩm nang (/cam-nang)
 */
export default function ExploreSheet({ isOpen, onClose }) {
  const navigate = useNavigate()
  const location = useLocation()

  // Hỗ trợ phím Escape để đóng sheet
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const items = [
    {
      path: '/cau-chuyen',
      label: 'Câu chuyện thương hiệu',
      desc: 'Hành trình gìn giữ nghề chiếu cói truyền thống',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
        </svg>
      )
    },
    {
      path: '/qua-tang-doanh-nghiep',
      label: 'Quà tặng doanh nghiệp',
      desc: 'Set quà tinh tế, mang đậm văn hóa xứ Nẫu cho đối tác',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
          <polyline points="20 12 20 22 4 22 4 12"></polyline>
          <rect x="2" y="7" width="20" height="5"></rect>
          <line x1="12" y1="22" x2="12" y2="7"></line>
          <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path>
          <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path>
        </svg>
      )
    },
    {
      path: '/tac-dong-xa-hoi',
      label: 'Tác động xã hội',
      desc: 'Tạo sinh kế bền vững cho nghệ nhân làng nghề',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      )
    },
    {
      path: '/cam-nang',
      label: 'Cẩm nang sử dụng & bảo quản',
      desc: 'Bí quyết giữ chiếu bền đẹp tự nhiên theo thời gian',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
      )
    }
  ]

  const handleSelect = (path) => {
    navigate(path)
    onClose()
  }

  return (
    <>
      <div
        className="app-explore-sheet-backdrop"
        onClick={onClose}
        aria-hidden="true"
      />
      <section
        className="app-explore-sheet"
        role="dialog"
        aria-modal="true"
        aria-label="Khám phá Chiếu Nẫu"
      >
        <div className="app-explore-sheet-handle" aria-hidden="true" />
        <div className="app-explore-sheet-header">
          <div>
            <h3 className="app-explore-sheet-title">Khám Phá Chiếu Nẫu</h3>
            <p className="app-explore-sheet-subtitle">Văn hóa làng nghề và thông tin hữu ích</p>
          </div>
          <button
            type="button"
            className="app-explore-sheet-close"
            onClick={onClose}
            aria-label="Đóng cửa sổ khám phá"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="18" height="18">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="app-explore-sheet-list">
          {items.map((item) => {
            const isActive = location.pathname.startsWith(item.path)
            return (
              <button
                key={item.path}
                type="button"
                className={`app-explore-item ${isActive ? 'active' : ''}`}
                onClick={() => handleSelect(item.path)}
              >
                <div className="app-explore-item-icon">
                  {item.icon}
                </div>
                <div className="app-explore-item-content">
                  <div className="app-explore-item-label">{item.label}</div>
                  <div className="app-explore-item-desc">{item.desc}</div>
                </div>
                <div className="app-explore-item-arrow" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="16" height="16">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </div>
              </button>
            )
          })}
        </div>
      </section>
    </>
  )
}
