import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../contexts/AuthContext'

const QUICK_REPLIES = [
  'Dạ Chiếu Nẫu xin chào Quý khách! Em có thể hỗ trợ gì cho mình ạ?',
  'Dạ sản phẩm này bên em đang có sẵn hàng, giao toàn quốc trong 2-3 ngày ạ.',
  'Dạ bên em miễn phí giao hàng tiêu chuẩn toàn quốc cho tất cả đơn hàng ạ.',
  'Dạ set quà doanh nghiệp bên em có hỗ trợ in/khắc logo theo yêu cầu ạ.'
]

export default function AdminLiveChat() {
  const { token } = useAuth()
  const [sessions, setSessions] = useState([])
  const [activeSessionId, setActiveSessionId] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const [mobileView, setMobileView] = useState('list') // 'list' | 'chat'

  const messagesEndRef = useRef(null)

  // Fetch all chat sessions
  const fetchSessions = async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const res = await fetch('/api/admin/livechat', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        const list = data.sessions || []
        setSessions(list)
        // Auto select first session if none selected
        if (!activeSessionId && list.length > 0) {
          setActiveSessionId(list[0].sessionId)
        }
      }
    } catch (err) {
      console.error('Error fetching chat sessions:', err)
    } finally {
      if (!silent) setLoading(false)
    }
  }

  // Initial load & Polling every 3s for real-time customer messages
  useEffect(() => {
    fetchSessions()
    const interval = setInterval(() => fetchSessions(true), 3000)
    return () => clearInterval(interval)
  }, [token])

  const activeSession = sessions.find((s) => s.sessionId === activeSessionId)

  // Auto scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeSession?.messages?.length])

  // Mark session as read when selected
  useEffect(() => {
    if (activeSessionId && activeSession?.unread > 0) {
      fetch(`/api/admin/livechat/${activeSessionId}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      }).catch(console.error)
    }
  }, [activeSessionId, activeSession?.unread, token])

  // Send reply to customer
  const handleSendReply = async (e) => {
    e?.preventDefault()
    if (!replyText.trim() || sending || !activeSessionId) return

    setSending(true)
    try {
      const res = await fetch(`/api/admin/livechat/${activeSessionId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ text: replyText.trim() })
      })

      if (res.ok) {
        const data = await res.json()
        setSessions((prev) =>
          prev.map((s) => (s.sessionId === activeSessionId ? data.session : s))
        )
        setReplyText('')
      }
    } catch (err) {
      console.error('Error sending reply:', err)
      alert('Không thể gửi phản hồi, vui lòng kiểm tra kết nối.')
    } finally {
      setSending(false)
    }
  }

  const handleSelectSession = (id) => {
    setActiveSessionId(id)
    setMobileView('chat')
  }

  // Filter sessions by name or phone
  const filteredSessions = sessions.filter((s) => {
    const q = searchQuery.toLowerCase()
    return (
      (s.customerName || '').toLowerCase().includes(q) ||
      (s.phone || '').includes(q)
    )
  })

  const totalUnread = sessions.reduce((acc, s) => acc + (s.unread || 0), 0)

  return (
    <div className="admin-page admin-chat-page">
      {/* Header Bar */}
      <div className="admin-page-header" style={{ marginBottom: '1.25rem' }}>
        <div className="admin-page-header-row">
          <div>
            <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', margin: '0 0 0.25rem' }}>
              <span>💬</span> Live Chat Hỗ Trợ Khách Hàng
            </h1>
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
              Trò chuyện và phản hồi trực tiếp với khách hàng đang truy cập website
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className="livechat-status-indicator">
              <span className="livechat-pulse-dot"></span> Đang trực tuyến
            </span>
            {totalUnread > 0 && (
              <span className="status-badge status-pending" style={{ fontSize: '0.85rem', padding: '0.35rem 0.75rem' }}>
                🔥 {totalUnread} tin chưa đọc
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Chat Hub Window */}
      <div className={`admin-chat-layout ${mobileView === 'chat' ? 'show-mobile-chat' : 'show-mobile-list'}`}>
        {/* ─── Left Column: Sessions List ─── */}
        <aside className="admin-chat-sidebar">
          <div className="admin-chat-sidebar-header">
            <div className="sidebar-title-row">
              <h3>Khách hàng ({filteredSessions.length})</h3>
              <button
                type="button"
                className="admin-refresh-btn"
                onClick={() => fetchSessions()}
                title="Làm mới danh sách"
              >
                🔄 Làm mới
              </button>
            </div>

            {/* Search Box */}
            <div className="admin-chat-search">
              <input
                type="text"
                placeholder="Tìm theo tên hoặc số điện thoại..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* List */}
          <div className="admin-chat-session-list">
            {loading && sessions.length === 0 ? (
              <div className="admin-chat-empty">Đang tải cuộc trò chuyện...</div>
            ) : filteredSessions.length === 0 ? (
              <div className="admin-chat-empty">
                <p>Không có cuộc trò chuyện nào.</p>
                <small>Tin nhắn của khách trên web sẽ tự động xuất hiện tại đây.</small>
              </div>
            ) : (
              filteredSessions.map((session) => {
                const isSelected = session.sessionId === activeSessionId
                const lastMsg = session.messages?.[session.messages.length - 1]
                const date = new Date(session.updatedAt || session.createdAt)
                const timeStr = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`

                return (
                  <div
                    key={session.sessionId}
                    className={`admin-chat-session-item ${isSelected ? 'active' : ''} ${session.unread > 0 ? 'unread' : ''}`}
                    onClick={() => handleSelectSession(session.sessionId)}
                  >
                    <div className="session-avatar">
                      {session.customerName?.charAt(0)?.toUpperCase() || 'K'}
                    </div>
                    <div className="session-info">
                      <div className="session-top">
                        <strong className="session-name">{session.customerName}</strong>
                        <span className="session-time">{timeStr}</span>
                      </div>
                      {session.phone && (
                        <div className="session-phone">📞 {session.phone}</div>
                      )}
                      <div className="session-preview">
                        {lastMsg ? (
                          <>
                            {lastMsg.sender === 'staff' && <span>Bạn: </span>}
                            {lastMsg.text}
                          </>
                        ) : (
                          'Bắt đầu cuộc trò chuyện'
                        )}
                      </div>
                    </div>
                    {session.unread > 0 && (
                      <span className="session-unread-badge">{session.unread}</span>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </aside>

        {/* ─── Right Column: Active Conversation ─── */}
        <section className="admin-chat-main">
          {activeSession ? (
            <>
              {/* Header */}
              <div className="admin-chat-main-header">
                <div className="chat-client-info">
                  {/* Mobile back button */}
                  <button
                    type="button"
                    className="admin-mobile-back-btn"
                    onClick={() => setMobileView('list')}
                    title="Quay lại danh sách"
                  >
                    ←
                  </button>

                  <div className="chat-client-avatar">
                    {activeSession.customerName?.charAt(0)?.toUpperCase() || 'K'}
                  </div>

                  <div>
                    <h4 style={{ margin: '0 0 0.15rem', color: 'var(--primary-dark)', fontSize: '1.05rem' }}>
                      {activeSession.customerName}
                    </h4>
                    <div className="chat-client-meta">
                      {activeSession.phone ? (
                        <a href={`tel:${activeSession.phone}`} className="client-phone-link">
                          📞 {activeSession.phone}
                        </a>
                      ) : (
                        <span>Khách chưa để lại số điện thoại</span>
                      )}
                      <span className="client-status-dot">🟢 Đang trên website</span>
                    </div>
                  </div>
                </div>

                <div className="chat-header-actions">
                  <span className="session-id-pill">ID: {activeSession.sessionId.slice(0, 16)}...</span>
                </div>
              </div>

              {/* Message Stream */}
              <div className="admin-chat-stream">
                {activeSession.messages?.map((msg, idx) => {
                  const isStaff = msg.sender === 'staff'
                  const msgTime = new Date(msg.createdAt || Date.now())
                  const timeFormatted = `${msgTime.getHours().toString().padStart(2, '0')}:${msgTime.getMinutes().toString().padStart(2, '0')}`

                  return (
                    <div
                      key={msg.id || idx}
                      className={`admin-msg-row ${isStaff ? 'admin-msg-row--staff' : 'admin-msg-row--customer'}`}
                    >
                      <div className="admin-msg-bubble">
                        <div className="admin-msg-sender">
                          {isStaff ? '👨‍💼 Bạn (Nhân viên tư vấn)' : `👤 ${activeSession.customerName}`}
                        </div>
                        <div className="admin-msg-text">{msg.text}</div>
                        <div className="admin-msg-time">{timeFormatted}</div>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Reply Chips */}
              <div className="admin-quick-replies">
                <span className="admin-qr-label">Trả lời nhanh:</span>
                {QUICK_REPLIES.map((qr, i) => (
                  <button
                    key={i}
                    type="button"
                    className="admin-qr-btn"
                    onClick={() => setReplyText(qr)}
                    title={qr}
                  >
                    {qr}
                  </button>
                ))}
              </div>

              {/* Input Reply Bar */}
              <form className="admin-chat-reply-bar" onSubmit={handleSendReply}>
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Soạn phản hồi gửi đến ${activeSession.customerName}...`}
                  disabled={sending}
                />
                <button
                  type="submit"
                  className="admin-send-btn"
                  disabled={sending || !replyText.trim()}
                >
                  {sending ? 'Đang gửi...' : 'Gửi phản hồi ↵'}
                </button>
              </form>
            </>
          ) : (
            <div className="admin-chat-placeholder">
              <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>💬</div>
              <h3>Chưa chọn cuộc trò chuyện</h3>
              <p>Hãy chọn một khách hàng từ danh sách bên trái để xem tin nhắn và phản hồi.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
