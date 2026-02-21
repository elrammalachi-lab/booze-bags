import { useMemo } from 'react'

const fmt = (amount) => `₪${Number(amount || 0).toLocaleString('he-IL')}`

const fmtDate = (dateStr) => {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const statusBadgeClass = (s) =>
  s === 'open' ? 'badge badge-open' : s === 'in-progress' ? 'badge badge-inprogress' : 'badge badge-closed'

const statusLabel = (s) =>
  s === 'open' ? 'פתוחה' : s === 'in-progress' ? 'בטיפול' : 'סגורה'

function StatCard({ icon, value, label, sublabel, color }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${color}`}>{icon}</div>
      <div className="stat-info">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
        {sublabel && <div className="stat-sublabel">{sublabel}</div>}
      </div>
    </div>
  )
}

function Dashboard({ orders, onAddNew, onEdit }) {
  const stats = useMemo(() => {
    const totalRevenue = orders.reduce(
      (sum, o) => sum + (Number(o.packagePrice) || 0) + (Number(o.extras) || 0),
      0
    )
    const totalProfit = orders.reduce((sum, o) => {
      const rev = (Number(o.packagePrice) || 0) + (Number(o.extras) || 0)
      return sum + rev - (Number(o.productionCost) || 0)
    }, 0)
    const totalBags = orders.reduce((sum, o) => sum + (Number(o.bagCount) || 0), 0)
    const open = orders.filter((o) => o.status === 'open').length
    const inProgress = orders.filter((o) => o.status === 'in-progress').length
    const closed = orders.filter((o) => o.status === 'closed').length
    const margin =
      totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 100) : 0

    return { total: orders.length, totalRevenue, totalProfit, totalBags, open, inProgress, closed, margin }
  }, [orders])

  // Upcoming events — next 60 days, sorted by date
  const upcomingOrders = useMemo(() => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const cutoff = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000)
    return orders
      .filter((o) => {
        if (!o.eventDate) return false
        const d = new Date(o.eventDate)
        return d >= now && d <= cutoff
      })
      .sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate))
      .slice(0, 5)
  }, [orders])

  // Recent orders — last added
  const recentOrders = useMemo(() => {
    return [...orders]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 6)
  }, [orders])

  return (
    <div className="dashboard">
      {/* ── Main KPIs ── */}
      <div className="stats-grid">
        <StatCard
          icon="📦"
          value={stats.total}
          label="סה״כ הזמנות"
          color="violet"
        />
        <StatCard
          icon="💰"
          value={fmt(stats.totalRevenue)}
          label="הכנסות כוללות"
          color="cyan"
        />
        <StatCard
          icon="📈"
          value={fmt(stats.totalProfit)}
          label="רווח כולל"
          sublabel={stats.total > 0 ? `מרווח ${stats.margin}%` : undefined}
          color="green"
        />
        <StatCard
          icon="🛍️"
          value={stats.totalBags.toLocaleString('he-IL')}
          label="שקיות שנמכרו"
          color="amber"
        />
      </div>

      {/* ── Status Cards ── */}
      <div className="status-row">
        <div className="status-card open">
          <div>
            <div className="status-card-label">הזמנות פתוחות</div>
            <div className="status-card-value">{stats.open}</div>
          </div>
          <span className="status-card-icon">🕐</span>
        </div>
        <div className="status-card in-progress">
          <div>
            <div className="status-card-label">בטיפול</div>
            <div className="status-card-value">{stats.inProgress}</div>
          </div>
          <span className="status-card-icon">⚙️</span>
        </div>
        <div className="status-card closed">
          <div>
            <div className="status-card-label">הזמנות סגורות</div>
            <div className="status-card-value">{stats.closed}</div>
          </div>
          <span className="status-card-icon">✅</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* ── Upcoming Events ── */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">⏰  אירועים קרובים (60 יום)</h3>
            <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>
              {upcomingOrders.length} אירועים
            </span>
          </div>
          {upcomingOrders.length === 0 ? (
            <div className="empty-state" style={{ padding: '32px 20px' }}>
              <div className="empty-state-icon" style={{ fontSize: 36 }}>📅</div>
              <p className="empty-state-text" style={{ fontSize: 13 }}>
                אין אירועים ב-60 הימים הקרובים
              </p>
            </div>
          ) : (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>לקוח</th>
                    <th>תאריך</th>
                    <th>שקיות</th>
                    <th>סטטוס</th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingOrders.map((o) => (
                    <tr key={o.id} style={{ cursor: 'pointer' }} onClick={() => onEdit(o)}>
                      <td className="td-bold">{o.customerName}</td>
                      <td>{fmtDate(o.eventDate)}</td>
                      <td className="td-center" style={{ fontWeight: 600 }}>
                        {o.bagCount}
                      </td>
                      <td>
                        <span className={statusBadgeClass(o.status)}>
                          {statusLabel(o.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Recent Orders ── */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">🕒  הזמנות אחרונות</h3>
            <button className="btn btn-violet btn-sm" onClick={onAddNew}>
              + הזמנה חדשה
            </button>
          </div>
          {recentOrders.length === 0 ? (
            <div className="empty-state" style={{ padding: '32px 20px' }}>
              <div className="empty-state-icon" style={{ fontSize: 36 }}>📋</div>
              <p className="empty-state-text" style={{ fontSize: 13 }}>
                אין הזמנות עדיין
              </p>
              <button className="btn btn-violet btn-sm" onClick={onAddNew}>
                הוסף הזמנה ראשונה
              </button>
            </div>
          ) : (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>לקוח</th>
                    <th>אירוע</th>
                    <th>הכנסה</th>
                    <th>רווח</th>
                    <th>סטטוס</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((o) => {
                    const rev = (Number(o.packagePrice) || 0) + (Number(o.extras) || 0)
                    const profit = rev - (Number(o.productionCost) || 0)
                    return (
                      <tr key={o.id} style={{ cursor: 'pointer' }} onClick={() => onEdit(o)}>
                        <td className="td-bold">{o.customerName}</td>
                        <td style={{ color: 'var(--gray-500)', fontSize: 12 }}>
                          {o.eventType || '—'}
                        </td>
                        <td className="td-revenue">{fmt(rev)}</td>
                        <td className={profit >= 0 ? 'td-profit' : 'td-loss'}>
                          {fmt(profit)}
                        </td>
                        <td>
                          <span className={statusBadgeClass(o.status)}>
                            {statusLabel(o.status)}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
