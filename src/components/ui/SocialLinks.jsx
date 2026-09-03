export default function SocialLinks({ small = false }) {
  const style = small ? { justifyContent: 'flex-start', gap: '1rem' } : {}
  const iconStyle = small ? { width: '36px', height: '36px' } : {}
  const iconSize = small ? 16 : undefined

  return (
    <div className="social-links" style={style}>
      <a href="https://www.facebook.com/search/top/?q=Chi%E1%BA%BFu%20N%E1%BA%ABu" target="_blank" rel="noopener noreferrer" className="social-link" style={iconStyle} title="Facebook - Chiếu Nẫu" aria-label="Facebook">
        <svg viewBox="0 0 24 24" width={iconSize} height={iconSize}><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
      </a>
      <a href="https://www.instagram.com/chieu.nau/" target="_blank" rel="noopener noreferrer" className="social-link" style={iconStyle} title="Instagram - chieu.nau" aria-label="Instagram">
        <svg viewBox="0 0 24 24" width={iconSize} height={iconSize}><rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor"/></svg>
      </a>
      <a href="https://www.threads.com/@chieu.nau" target="_blank" rel="noopener noreferrer" className="social-link" style={iconStyle} title="Threads - chieu.nau" aria-label="Threads">
        <svg viewBox="0 0 24 24" width={iconSize} height={iconSize} fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 14.93a4.93 4.93 0 0 1-4.93-4.93A4.93 4.93 0 0 1 13 7.07a4.87 4.87 0 0 1 3.5 1.5 1 1 0 0 1-1.42 1.42 2.87 2.87 0 0 0-2.08-.92 2.93 2.93 0 0 0-2.93 2.93 2.93 2.93 0 0 0 2.93 2.93 2.87 2.87 0 0 0 2.08-.92 1 1 0 0 1 1.42 1.42 4.87 4.87 0 0 1-3.5 1.5z"/></svg>
      </a>
      <a href="https://www.tiktok.com/@chieunau.official?_r=1&_t=ZS-9969M4iOzdl" target="_blank" rel="noopener noreferrer" className="social-link" style={iconStyle} title="TikTok - chieunau.official" aria-label="TikTok">
        <svg viewBox="0 0 24 24" width={iconSize} height={iconSize}><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.88-2.88 2.89 2.89 0 012.88-2.88c.28 0 .56.04.81.12v-3.49a6.37 6.37 0 00-.81-.05A6.34 6.34 0 003.15 15.4a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V9.37a8.16 8.16 0 004.76 1.52V7.44a4.85 4.85 0 01-1-.75z"/></svg>
      </a>
      <a href="mailto:lienhe.chieunau@gmail.com" className="social-link" style={iconStyle} title="Email: lienhe.chieunau@gmail.com" aria-label="Email">
        <svg viewBox="0 0 24 24" width={iconSize} height={iconSize} fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 4l-10 8L2 4"/></svg>
      </a>
    </div>
  )
}
