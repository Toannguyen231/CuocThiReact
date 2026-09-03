import { useState, useRef, useEffect } from 'react'
import { useCustomerAuth } from '../../contexts/CustomerAuthContext'

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || ''
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`

const FB_MESSENGER_LINK = 'https://www.facebook.com/profile.php?id=61593590940438'
const FB_CHAT_LINK = 'https://m.me/61593590940438'
const ZALO_PHONE = '0901234567'
const ZALO_LINK = `https://zalo.me/${ZALO_PHONE}`

const SYSTEM_INSTRUCTION = `Bạn là "Trợ lý ảo Chiếu Nẫu" — đại diện hỗ trợ khách hàng thân thiện, am hiểu và nhiệt tình của thương hiệu Chiếu Nẫu (Gìn Nghề — Giữ Sinh Kế).

THÔNG TIN VỀ CHIẾU NẪU:
- Ý nghĩa & Sứ mệnh: "Gìn Nghề — Giữ Sinh Kế". Dự án xuất phát từ mong muốn bảo tồn nghề dệt chiếu cói truyền thống lâu đời (làng nghề Phú Tân, An Giang và duyên hải Nam Trung Bộ/Bình Định), đồng thời tạo việc làm và thu nhập ổn định cho nghệ nhân, đặc biệt là phụ nữ nông thôn.
- Vật liệu: 100% sợi cói tự nhiên, thân thiện với môi trường, phân hủy sinh học, an toàn cho sức khỏe, giữ mùi thơm thanh nhẹ của thảo mộc tự nhiên.
- Danh mục sản phẩm:
  1. Túi xách cói: Túi Xách Cói Bán Nguyệt (180.000₫ - 350.000₫), Túi Đeo Chéo Cói phối da (120.000₫ - 200.000₫).
  2. Lót nồi cói: Lót Nồi Cói Đan Thủ Công xoắn ốc đa sắc (45.000₫ - 85.000₫).
  3. Quạt cói: Quạt Cói Truyền Thống họa tiết tinh xảo (35.000₫ - 65.000₫).
  4. Quà tặng doanh nghiệp (B2B): Các set quà sinh thái ý nghĩa như Set An Yên (380.000₫), Set Gắn Kết (520.000₫), Set Tri Ân (750.000₫), hỗ trợ in/khắc logo doanh nghiệp, thiệp viết tay, hộp quà kraft thân thiện môi trường.
- Chính sách bán hàng:
  + Giao hàng tiêu chuẩn toàn quốc (miễn phí), giao nhanh nội thành (30.000₫).
  + Thanh toán linh hoạt: Tiền mặt khi nhận hàng (COD) hoặc Chuyển khoản ngân hàng.
  + Đổi trả trong 7 ngày nếu sản phẩm có lỗi kỹ thuật do nhà sản xuất.
- Kênh liên hệ trực tiếp với nhân viên:
  + Facebook Fanpage: ${FB_MESSENGER_LINK}
  + Zalo Hotline: ${ZALO_PHONE} (${ZALO_LINK})

PHONG CÁCH TRẢ LỜI:
- Xưng hô lịch sự, ấm áp (Em/Chiếu Nẫu và Quý khách hoặc Anh/Chị).
- Trả lời súc tích, rõ ràng, gạch đầu dòng ngắn gọn dễ đọc.
- Nếu khách hàng cần đặt hàng số lượng lớn, in logo doanh nghiệp hoặc muốn nói chuyện với nhân viên thật, hãy hướng dẫn khách chuyển sang tab "Nhân viên hỗ trợ" hoặc liên hệ qua Zalo/Messenger.`

const QUICK_PROMPTS = [
  '🌿 Chiếu Nẫu có sản phẩm gì?',
  '🎁 Tư vấn quà doanh nghiệp B2B',
  '🚚 Phí ship & thanh toán thế nào?',
  '✨ Túi cói có bền không?'
]

const STAFF_QUICK_PROMPTS = [
  'Xin chào, em muốn tư vấn đặt hàng',
  'Shop ơi có mẫu quà tặng doanh nghiệp không?',
  'Cho mình hỏi thời gian giao hàng đến TP.HCM'
]

// Render simple markdown safely
function FormattedText({ text }) {
  if (!text) return null
  const paragraphs = text.split('\n\n')

  return (
    <div>
      {paragraphs.map((para, i) => {
        const lines = para.split('\n')
        return (
          <p key={i} style={{ margin: '0 0 0.5rem' }}>
            {lines.map((line, j) => {
              const parts = line.split(/(\*\*.*?\*\*)/g)
              return (
                <span key={j} style={{ display: 'block' }}>
                  {parts.map((part, k) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                      return <strong key={k}>{part.slice(2, -2)}</strong>
                    }
                    return part
                  })}
                </span>
              )
            })}
          </p>
        )
      })}
    </div>
  )
}

export default function SupportHub() {
  const { customer } = useCustomerAuth()

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('ai') // 'ai' | 'staff'
  const [showZaloModal, setShowZaloModal] = useState(false)

  // AI Chat State
  const [aiMessages, setAiMessages] = useState([
    {
      sender: 'ai',
      text: 'Dạ xin chào Quý khách! Em là Trợ lý AI của Chiếu Nẫu 🌿. Em có thể giải đáp ngay về sản phẩm cói, set quà doanh nghiệp, chính sách giao hàng 24/7 ạ!'
    }
  ])
  const [aiInput, setAiInput] = useState('')
  const [aiLoading, setAiLoading] = useState(false)

  // Live Chat with Staff State
  const [sessionId, setSessionId] = useState(() => {
    return localStorage.getItem('chieunau_livechat_session') || `session_${Date.now()}`
  })
  const [staffMessages, setStaffMessages] = useState([])
  const [staffInput, setStaffInput] = useState('')
  const [staffLoading, setStaffLoading] = useState(false)
  const [customerContact, setCustomerContact] = useState('')

  const messagesEndRef = useRef(null)
  const staffMessagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const hubRef = useRef(null)

  // Save session ID
  useEffect(() => {
    localStorage.setItem('chieunau_livechat_session', sessionId)
  }, [sessionId])

  // Fetch live chat messages from backend
  const fetchLiveSession = async () => {
    if (!sessionId) return
    try {
      const res = await fetch(`/api/livechat/session/${sessionId}`)
      if (res.ok) {
        const data = await res.json()
        if (data.session && data.session.messages) {
          setStaffMessages(data.session.messages)
        }
      }
    } catch (err) {
      console.warn('Polling live chat error:', err)
    }
  }

  // Poll live chat session every 3s when chat window is open
  useEffect(() => {
    if (!isChatOpen) return
    fetchLiveSession()
    const timer = setInterval(fetchLiveSession, 3000)
    return () => clearInterval(timer)
  }, [isChatOpen, sessionId])

  // Scroll to bottom
  useEffect(() => {
    if (isChatOpen) {
      if (activeTab === 'ai') {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      } else {
        staffMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }
      inputRef.current?.focus()
    }
  }, [isChatOpen, activeTab, aiMessages, staffMessages, aiLoading, staffLoading])

  // Close speed dial when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (hubRef.current && !hubRef.current.contains(e.target)) {
        setIsMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Send message to AI (Gemini)
  const handleSendAiMessage = async (userText) => {
    const textToSend = (userText || aiInput).trim()
    if (!textToSend || aiLoading) return

    const newMessages = [...aiMessages, { sender: 'user', text: textToSend }]
    setAiMessages(newMessages)
    setAiInput('')
    setAiLoading(true)

    try {
      const contents = [
        {
          role: 'user',
          parts: [{ text: `${SYSTEM_INSTRUCTION}\n\nKhách hàng hỏi: ${textToSend}` }]
        }
      ]

      const res = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 600
          }
        })
      })

      const data = await res.json()
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text ||
        'Dạ Chiếu Nẫu đã nhận được câu hỏi. Quý khách có thể chuyển sang tab "Nhân viên tư vấn" để nói chuyện với nhân viên trực tiếp ạ!'

      setAiMessages([...newMessages, { sender: 'ai', text: reply }])
    } catch (err) {
      console.error('Gemini error:', err)
      setAiMessages([
        ...newMessages,
        {
          sender: 'ai',
          text: 'Dạ mạng đang bận một chút, Quý khách vui lòng chuyển sang tab "Nhân viên tư vấn" hoặc nhắn qua Zalo/Messenger để nhân viên hỗ trợ ngay nhé ạ!'
        }
      ])
    } finally {
      setAiLoading(false)
    }
  }

  // Send message to Staff (Live Chat on Web)
  const handleSendStaffMessage = async (customText) => {
    const textToSend = (customText || staffInput).trim()
    if (!textToSend || staffLoading) return

    const tempMsg = {
      id: Date.now(),
      sender: 'customer',
      text: textToSend,
      createdAt: new Date().toISOString()
    }
    setStaffMessages(prev => [...prev, tempMsg])
    setStaffInput('')
    setStaffLoading(true)

    try {
      const customerName = customer?.name || 'Khách truy cập web'
      const phone = customer?.phone || customerContact || ''

      const res = await fetch('/api/livechat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          text: textToSend,
          customerName,
          phone
        })
      })

      if (res.ok) {
        const data = await res.json()
        if (data.session && data.session.messages) {
          setStaffMessages(data.session.messages)
        }
      }
    } catch (err) {
      console.error('Live chat send error:', err)
    } finally {
      setStaffLoading(false)
    }
  }

  return (
    <>
      {/* ─── Compact Floating Circular Bubble Hub ─── */}
      <div className="support-fab-hub" ref={hubRef}>
        {/* Speed-dial options (expand vertically when isMenuOpen is true) */}
        <div className={`support-speed-dial ${isMenuOpen ? 'open' : ''}`}>
          {/* 1. Chat with Human Staff directly on Web */}
          <button
            type="button"
            className="speed-dial-item speed-dial-item--staff"
            onClick={() => {
              setActiveTab('staff')
              setIsChatOpen(true)
              setIsMenuOpen(false)
            }}
            title="Nhắn tin trực tiếp với Nhân viên trên website"
          >
            <span className="speed-dial-label">Nhân viên trực tiếp (Web)</span>
            <div className="speed-dial-btn" style={{ background: '#0284c7' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
          </button>

          {/* 2. Messenger / Zalo Apps */}
          <button
            type="button"
            className="speed-dial-item speed-dial-item--zalo"
            onClick={() => {
              setShowZaloModal(true)
              setIsMenuOpen(false)
            }}
            title="Liên hệ Zalo / Messenger ngoài"
          >
            <span className="speed-dial-label">Zalo & Messenger</span>
            <div className="speed-dial-btn" style={{ background: 'linear-gradient(135deg, #0068FF, #00B2FF)' }}>
              <span style={{ fontWeight: 900, fontSize: '0.82rem' }}>App</span>
            </div>
          </button>

          {/* 3. AI Assistant Bubble */}
          <button
            type="button"
            className="speed-dial-item speed-dial-item--ai"
            onClick={() => {
              setActiveTab('ai')
              setIsChatOpen(true)
              setIsMenuOpen(false)
            }}
            title="Hỏi đáp tức thì với Trợ lý AI"
          >
            <span className="speed-dial-label">Trợ lý AI 24/7</span>
            <div className="speed-dial-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                <rect x="3" y="11" width="18" height="10" rx="2" />
                <circle cx="12" cy="5" r="2" />
                <path d="M12 7v4" />
                <line x1="8" y1="16" x2="8.01" y2="16" />
                <line x1="16" y1="16" x2="16.01" y2="16" />
              </svg>
            </div>
          </button>
        </div>

        {/* Main Floating Trigger Button (Single Round Bubble) */}
        <button
          type="button"
          className={`support-fab-trigger ${isMenuOpen ? 'active' : ''}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Hỗ trợ và liên hệ"
          title="Hỗ trợ & Liên hệ trực tiếp trên web"
        >
          {/* Online green indicator dot */}
          <span className="fab-online-badge"></span>

          {/* Rotating Icon */}
          <div className="fab-icon-wrap">
            {isMenuOpen ? (
              <svg className="fab-icon-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="22" height="22">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg className="fab-icon-chat" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
            )}
          </div>
        </button>
      </div>

      {/* ─── Unified Web Chat Window ─── */}
      {isChatOpen && (
        <div className="support-chat-window" role="dialog" aria-label="Khung chat hỗ trợ trực tiếp">
          {/* Header */}
          <div className="support-chat-header">
            <div className="support-chat-header-info">
              <img src="/logo.png" alt="Chiếu Nẫu Logo" className="support-chat-avatar" />
              <div className="support-chat-title">
                <h4>Hỗ Trợ Chiếu Nẫu</h4>
                <div className="support-chat-status">
                  <span className="bubble-online-dot"></span>
                  {activeTab === 'ai' ? 'Trợ lý AI (Phản hồi tức thì)' : 'Nhân viên tư vấn (Trực tiếp)'}
                </div>
              </div>
            </div>
            <button
              type="button"
              className="support-chat-close-btn"
              onClick={() => setIsChatOpen(false)}
              aria-label="Đóng khung chat"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="chat-channel-tabs">
            <button
              type="button"
              className={`chat-channel-tab ${activeTab === 'ai' ? 'active' : ''}`}
              onClick={() => setActiveTab('ai')}
            >
              🤖 Trợ lý AI (24/7)
            </button>
            <button
              type="button"
              className={`chat-channel-tab ${activeTab === 'staff' ? 'active' : ''}`}
              onClick={() => setActiveTab('staff')}
            >
              👨‍💼 Nhân viên tư vấn
              {staffMessages.some(m => m.sender === 'staff') && (
                <span className="tab-reply-indicator"></span>
              )}
            </button>
          </div>

          {/* ─── TAB 1: AI ASSISTANT ─── */}
          {activeTab === 'ai' && (
            <>
              <div className="support-chat-messages">
                {aiMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`chat-message-row ${msg.sender === 'user' ? 'chat-message-row--user' : 'chat-message-row--ai'}`}
                  >
                    {msg.sender === 'ai' && (
                      <img src="/logo.png" alt="AI" className="chat-msg-avatar" />
                    )}
                    <div className="chat-bubble">
                      <FormattedText text={msg.text} />
                    </div>
                  </div>
                ))}

                {aiLoading && (
                  <div className="chat-message-row chat-message-row--ai">
                    <img src="/logo.png" alt="AI" className="chat-msg-avatar" />
                    <div className="chat-typing-bubble">
                      <span className="chat-typing-dot"></span>
                      <span className="chat-typing-dot"></span>
                      <span className="chat-typing-dot"></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Suggestions Chips */}
              <div className="support-chat-quick-chips">
                {QUICK_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    type="button"
                    className="quick-chip-btn"
                    onClick={() => handleSendAiMessage(prompt)}
                    disabled={aiLoading}
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Handover Prompt */}
              <div className="chat-human-handover">
                <span>Cần tư vấn trực tiếp với nhân viên?</span>
                <button
                  type="button"
                  className="quick-chip-btn"
                  style={{ background: '#0284c7', color: '#fff', border: 'none' }}
                  onClick={() => setActiveTab('staff')}
                >
                  Chuyển sang Live Chat ↵
                </button>
              </div>

              {/* AI Input Bar */}
              <form
                className="support-chat-input-bar"
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSendAiMessage()
                }}
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  placeholder="Nhập câu hỏi cho Trợ lý AI..."
                  disabled={aiLoading}
                />
                <button
                  type="submit"
                  className="support-chat-send-btn"
                  disabled={aiLoading || !aiInput.trim()}
                  aria-label="Gửi tin nhắn"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </form>
            </>
          )}

          {/* ─── TAB 2: LIVE CHAT WITH HUMAN STAFF ─── */}
          {activeTab === 'staff' && (
            <>
              <div className="support-chat-messages">
                {staffMessages.length === 0 ? (
                  <div className="staff-welcome-box">
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>👨‍💼</div>
                    <h4>Trò chuyện trực tiếp với Nhân viên</h4>
                    <p>
                      Nhân viên Chiếu Nẫu sẽ phản hồi trực tiếp ngay trên màn hình này. Bạn có thể để lại tin nhắn hoặc số điện thoại để tiện trao đổi.
                    </p>
                    <div style={{ marginTop: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      {STAFF_QUICK_PROMPTS.map((sq, i) => (
                        <button
                          key={i}
                          type="button"
                          className="quick-chip-btn"
                          style={{ textAlign: 'left', whiteSpace: 'normal' }}
                          onClick={() => handleSendStaffMessage(sq)}
                        >
                          💬 {sq}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  staffMessages.map((msg, idx) => {
                    const isStaff = msg.sender === 'staff'
                    return (
                      <div
                        key={msg.id || idx}
                        className={`chat-message-row ${!isStaff ? 'chat-message-row--user' : 'chat-message-row--ai'}`}
                      >
                        {isStaff && (
                          <div className="staff-msg-badge-icon">👨‍💼</div>
                        )}
                        <div className="chat-bubble" style={isStaff ? { background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534' } : {}}>
                          {isStaff && (
                            <strong style={{ display: 'block', fontSize: '0.74rem', color: '#15803d', marginBottom: '0.2rem' }}>
                              Nhân viên hỗ trợ
                            </strong>
                          )}
                          <FormattedText text={msg.text} />
                        </div>
                      </div>
                    )
                  })
                )}

                {staffLoading && (
                  <div className="chat-message-row chat-message-row--user">
                    <div className="chat-typing-bubble" style={{ background: 'var(--primary)', opacity: 0.8 }}>
                      <span className="chat-typing-dot" style={{ background: '#fff' }}></span>
                      <span className="chat-typing-dot" style={{ background: '#fff' }}></span>
                      <span className="chat-typing-dot" style={{ background: '#fff' }}></span>
                    </div>
                  </div>
                )}
                <div ref={staffMessagesEndRef} />
              </div>

              {/* Optional Phone Contact Input */}
              {!customer?.phone && (
                <div style={{ padding: '0.35rem 1rem', background: '#f8faf6', borderTop: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem' }}>
                  <span>Số Zalo/ĐT:</span>
                  <input
                    type="tel"
                    value={customerContact}
                    onChange={(e) => setCustomerContact(e.target.value)}
                    placeholder="Để nhân viên gọi lại (tùy chọn)..."
                    style={{ flex: 1, border: '1px solid #ccc', borderRadius: 4, padding: '0.2rem 0.5rem', fontSize: '0.78rem' }}
                  />
                </div>
              )}

              {/* Staff Chat Input Bar */}
              <form
                className="support-chat-input-bar"
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSendStaffMessage()
                }}
              >
                <input
                  type="text"
                  value={staffInput}
                  onChange={(e) => setStaffInput(e.target.value)}
                  placeholder="Nhắn tin trực tiếp cho nhân viên..."
                  disabled={staffLoading}
                />
                <button
                  type="submit"
                  className="support-chat-send-btn"
                  style={{ background: '#0284c7' }}
                  disabled={staffLoading || !staffInput.trim()}
                  aria-label="Gửi tin cho nhân viên"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </form>
            </>
          )}
        </div>
      )}

      {/* ─── Zalo / Messenger Modal ─── */}
      {showZaloModal && (
        <div className="zalo-modal-overlay" onClick={() => setShowZaloModal(false)}>
          <div className="zalo-modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="zalo-modal-close"
              onClick={() => setShowZaloModal(false)}
              aria-label="Đóng"
            >
              ✕
            </button>

            <div style={{ width: 56, height: 56, background: 'linear-gradient(135deg, #0068FF, #00B2FF)', borderRadius: '50%', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', fontWeight: 900, marginBottom: '0.75rem' }}>
              💬
            </div>
            <h3 style={{ margin: '0 0 0.4rem', color: 'var(--primary-dark)', fontSize: '1.25rem' }}>Kênh Liên Hệ Nhân Viên</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
              Bạn có thể mở ứng dụng Zalo hoặc Messenger để trò chuyện trực tiếp:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
              <a
                href={ZALO_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary-action"
                style={{ width: '100%', textDecoration: 'none', background: '#0068FF', justifyContent: 'center' }}
              >
                📱 Mở Zalo Chat ({ZALO_PHONE})
              </a>

              <a
                href={FB_CHAT_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary-action"
                style={{ width: '100%', textDecoration: 'none', background: '#0084FF', justifyContent: 'center' }}
              >
                💬 Mở Facebook Messenger
              </a>
            </div>

            <button
              type="button"
              className="quick-chip-btn"
              style={{ width: '100%', justifyContent: 'center', padding: '0.6rem' }}
              onClick={() => {
                setShowZaloModal(false)
                setActiveTab('staff')
                setIsChatOpen(true)
              }}
            >
              👉 Hoặc nhắn tin ngay trên website này (Không cần mở app)
            </button>
          </div>
        </div>
      )}
    </>
  )
}
