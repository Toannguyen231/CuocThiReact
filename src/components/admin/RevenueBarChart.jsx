import { useState } from 'react'
import { formatPrice } from '../../utils/api'

export default function RevenueBarChart({ chartData }) {
  const [activeTab, setActiveTab] = useState('monthly') // 'monthly' | 'daily' | 'category'
  const [hoveredIndex, setHoveredIndex] = useState(null)

  const monthly = chartData?.monthlyRevenue || []
  const daily = chartData?.dailyRevenue || []
  const category = chartData?.categoryRevenue || []

  // Current data points
  const currentData =
    activeTab === 'monthly'
      ? monthly
      : activeTab === 'daily'
      ? daily
      : category

  // Compute metrics
  const maxRevenue = Math.max(...currentData.map((d) => d.revenue || 0), 1)
  const totalPeriodRevenue = currentData.reduce((sum, d) => sum + (d.revenue || 0), 0)
  const avgRevenue = Math.round(totalPeriodRevenue / (currentData.length || 1))

  // Find peak item
  const peakItem = [...currentData].sort((a, b) => (b.revenue || 0) - (a.revenue || 0))[0]

  // Y-axis grid levels (4 levels: 100%, 75%, 50%, 25%)
  const gridSteps = [1, 0.75, 0.5, 0.25]

  return (
    <div className="revenue-chart-card">
      {/* ─── Header & Period Toggle ─── */}
      <div className="revenue-chart-header">
        <div>
          <div className="revenue-chart-badge">
            <span>📈</span> Báo cáo Doanh Thu Chi Tiết
          </div>
          <h2 className="revenue-chart-title">Sơ Đồ Cột Tăng Trưởng Doanh Thu</h2>
          <p className="revenue-chart-sub">
            Theo dõi diễn biến doanh số và tỷ trọng theo từng chu kỳ kinh doanh
          </p>
        </div>

        {/* Period Selector Tabs */}
        <div className="revenue-tabs">
          <button
            type="button"
            className={`revenue-tab-btn ${activeTab === 'monthly' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('monthly')
              setHoveredIndex(null)
            }}
          >
            📅 6 Tháng gần nhất
          </button>
          <button
            type="button"
            className={`revenue-tab-btn ${activeTab === 'daily' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('daily')
              setHoveredIndex(null)
            }}
          >
            ⏱️ 7 Ngày qua
          </button>
          <button
            type="button"
            className={`revenue-tab-btn ${activeTab === 'category' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('category')
              setHoveredIndex(null)
            }}
          >
            📦 Theo Danh mục
          </button>
        </div>
      </div>

      {/* ─── Metric Highlights ─── */}
      <div className="revenue-metrics-row">
        <div className="revenue-metric-item">
          <span className="metric-label">Tổng doanh thu chu kỳ</span>
          <div className="metric-value-wrap">
            <strong className="metric-value">{formatPrice(totalPeriodRevenue)}</strong>
            <span className="metric-growth-badge">↗ +28.4%</span>
          </div>
        </div>

        <div className="revenue-metric-item">
          <span className="metric-label">Cao điểm nhất ({peakItem?.label || '—'})</span>
          <div className="metric-value-wrap">
            <strong className="metric-value" style={{ color: 'var(--primary)' }}>
              {formatPrice(peakItem?.revenue || 0)}
            </strong>
          </div>
        </div>

        <div className="revenue-metric-item">
          <span className="metric-label">Trung bình mỗi kỳ</span>
          <div className="metric-value-wrap">
            <strong className="metric-value" style={{ color: 'var(--accent-gold)' }}>
              {formatPrice(avgRevenue)}
            </strong>
          </div>
        </div>
      </div>

      {/* ─── Main Bar / Column Chart Canvas ─── */}
      <div className="revenue-canvas-container">
        {/* Y-Axis Guidelines & Labels */}
        <div className="chart-y-axis">
          {gridSteps.map((step, idx) => {
            const val = Math.round(maxRevenue * step)
            return (
              <div key={idx} className="chart-grid-line" style={{ bottom: `${step * 100}%` }}>
                <span className="chart-y-label">
                  {val >= 1000000 ? `${(val / 1000000).toFixed(1)}tr` : `${Math.round(val / 1000)}k`}
                </span>
              </div>
            )
          })}
          <div className="chart-grid-line" style={{ bottom: '0%' }}>
            <span className="chart-y-label">0₫</span>
          </div>
        </div>

        {/* Columns Flex Container */}
        <div className="chart-bars-track">
          {currentData.map((item, idx) => {
            const heightPercent = Math.max(Math.round((item.revenue / maxRevenue) * 100), 6)
            const isHovered = hoveredIndex === idx
            const isPeak = item.revenue === peakItem?.revenue

            return (
              <div
                key={idx}
                className="chart-col-wrapper"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Dynamic Tooltip on Hover */}
                {isHovered && (
                  <div className={`chart-bar-tooltip ${idx >= currentData.length - 2 ? 'tooltip--right' : idx === 0 ? 'tooltip--left' : ''}`}>
                    <div className="tooltip-title">
                      {item.icon && <span>{item.icon} </span>}
                      {item.label}
                    </div>
                    <div className="tooltip-revenue">{formatPrice(item.revenue)}</div>
                    {item.orders !== undefined && (
                      <div className="tooltip-orders">📦 {item.orders} đơn hàng đã bán</div>
                    )}
                    {item.percentage !== undefined && (
                      <div className="tooltip-orders">📊 Chiếm {item.percentage}% tổng doanh số</div>
                    )}
                    {item.growth && (
                      <div className="tooltip-growth" style={{ color: item.growth.startsWith('+') ? '#16a34a' : '#dc2626' }}>
                        Tăng trưởng: {item.growth}
                      </div>
                    )}
                  </div>
                )}

                {/* Top Amount Tag */}
                <div className={`chart-col-tag ${isPeak ? 'peak' : ''}`}>
                  {item.revenue >= 1000000
                    ? `${(item.revenue / 1000000).toFixed(1)}M`
                    : `${Math.round(item.revenue / 1000)}k`}
                </div>

                {/* The Column Bar */}
                <div
                  className={`chart-bar-pill ${isPeak ? 'chart-bar-peak' : ''} ${isHovered ? 'hovered' : ''}`}
                  style={{
                    height: `${heightPercent}%`,
                    background:
                      activeTab === 'category'
                        ? idx === 0
                          ? 'linear-gradient(180deg, #1e3a8a, #3b82f6)'
                          : idx === 1
                          ? 'linear-gradient(180deg, #15803d, #22c55e)'
                          : idx === 2
                          ? 'linear-gradient(180deg, #b45309, #f59e0b)'
                          : 'linear-gradient(180deg, #7e22ce, #a855f7)'
                        : isPeak
                        ? 'linear-gradient(180deg, #1c4b1c, #3d7a3d)'
                        : 'linear-gradient(180deg, #2d5a2d, #528c52)'
                  }}
                >
                  <div className="chart-bar-shine"></div>
                </div>

                {/* X-Axis Label */}
                <div className="chart-x-label">
                  {item.icon && <span className="x-icon">{item.icon}</span>}
                  <span className="x-text">{item.label}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ─── Footer Legend ─── */}
      <div className="revenue-chart-footer">
        <div className="chart-legend-item">
          <span className="legend-dot" style={{ background: '#1c4b1c' }}></span>
          <span>Kỳ doanh thu đạt đỉnh cao nhất</span>
        </div>
        <div className="chart-legend-item">
          <span className="legend-dot" style={{ background: '#2d5a2d' }}></span>
          <span>Doanh thu tiêu chuẩn</span>
        </div>
        <div className="chart-legend-item">
          <span className="legend-dot" style={{ background: '#d97706' }}></span>
          <span>Có phát sinh đơn hàng doanh nghiệp</span>
        </div>
      </div>
    </div>
  )
}
