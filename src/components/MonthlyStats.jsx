import { useMemo } from 'react'

const fmt = (amount) => `₪${Number(amount || 0).toLocaleString('he-IL')}`

const MONTH_NAMES = [
  'ינואר','פברואר','מרץ','אפריל','מאי','יוני',
  'יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר',
]

const statusBadgeClass = (s) =>
  s === 'open' ? 'badge badge-open' : s === 'in-progress' ? 'badge badge-inprogress' : 'badge badge-closed'

const statusLabel = (s) =>
  s === 'open' ? 'פתוחה' : s === 'in-progress' ? 'בטיפול' : 'סגורה'

function getMonthLabel(yearMonth) {
  const [year, month] = yearMonth.split('-')
  return { month: MONTH_NAMES[parseInt(month, 10) - 1], year }
}

function MonthlyStats({ orders }) {
  const monthlyData = useMemo(() => {
    const map = {}
    orders.forEach((o) => {
      if (!o.eventDate) return
      const ym = o.eventDate.substring(0, 7)
      if (!map[ym]) {
        map[ym] = {
          ym,
          orders: [],
          revenue: 0,
          profit: 0,
          bags: 0,
        }
      }
      const rev = (Number(o.packagePrice) || 0) + (Number(o.extras) || 0)
      const profit = rev - (Number(o.productionCost) || 0)
      map[ym].orders.push(o)
      map[ym].revenue += rev
      map[ym].profit += profit
      map[ym].bags += Number(o.bagCount) || 0
    })
    return Object.values(map).sort((a, b) => b.ym.localeCompare(a.ym))
  }, [orders])

  const totals = useMemo(
    () =>
      monthlyData.reduce(
        (acc, m) => ({
          orders: acc.orders + m.orders.length,
          revenue: acc.revenue + m.revenue,
          profit: acc.profit + m.profit,
          bags: acc.bags + m.bags,
        }),
        { orders: 0, revenue: 0, profit: 0, bags: 0 }
      ),
    [monthlyData]
  )

  if (monthlyData.length === 0) {
    return (
      <div className="card" style={{ padding: 0 }}>
        <div className="empty-state">
          <div className="empty-state-icon">📅</div>
          <p className="empty-state-text">אין נתונים לסיכום חודשי</p>
        </div>
      </div>
    )
  }

  const margin =
    totals.revenue > 0 ? Math.round((totals.profit / totals.revenue) * 100) : 0

  return (
    <div className="monthly-grid">
      {/* ── Grand Totals ── */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">סיכום כולל</h3>
          <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>
            מרווח ממוצע: {margin}%
          </span>
        </div>
        <div className="monthly-summary-grid">
          <div className="monthly-summary-item">
            <span className="monthly-summary-value v-violet">{totals.orders}</span>
            <span className="monthly-summary-label">הזמנות</span>
          </div>
          <div className="monthly-summary-item">
            <span className="monthly-summary-value v-cyan">{fmt(totals.revenue)}</span>
            <span className="monthly-summary-label">הכנסות</span>
          </div>
          <div className="monthly-summary-item">
            <span className="monthly-summary-value v-green">{fmt(totals.profit)}</span>
            <span className="monthly-summary-label">רווח</span>
          </div>
          <div className="monthly-summary-item">
            <span className="monthly-summary-value v-amber">
              {totals.bags.toLocaleString('he-IL')}
            </span>
            <span className="monthly-summary-label">שקיות</span>
          </div>
        </div>
      </div>

      {/* ── Per Month ── */}
      <h2 className="section-title">פירוט לפי חודשים</h2>

      {monthlyData.map((m) => {
        const { month, year } = getMonthLabel(m.ym)
        const monthMargin =
          m.revenue > 0 ? Math.round((m.profit / m.revenue) * 100) : 0

        return (
          <div key={m.ym} className="month-card">
            {/* Month header */}
            <div className="month-card-header">
              <div>
                <div className="month-card-title">{month} {year}</div>
                <div className="month-card-sub">{m.orders.length} הזמנות • מרווח {monthMargin}%</div>
              </div>
              <div style={{ textAlign: 'left', direction: 'ltr' }}>
                <div style={{ fontSize: 20, fontWeight: 800 }}>{fmt(m.profit)}</div>
                <div style={{ fontSize: 11, opacity: 0.7 }}>רווח חודשי</div>
              </div>
            </div>

            {/* Mini stats row */}
            <div className="month-mini-stats">
              <div className="month-mini-item">
                <span className="month-mini-label">הכנסה</span>
                <span className="month-mini-value v-cyan">{fmt(m.revenue)}</span>
              </div>
              <div className="month-mini-item">
                <span className="month-mini-label">רווח</span>
                <span className={`month-mini-value ${m.profit >= 0 ? 'v-green' : ''}`}
                  style={m.profit < 0 ? { color: 'var(--red)' } : {}}
                >
                  {fmt(m.profit)}
                </span>
              </div>
              <div className="month-mini-item">
                <span className="month-mini-label">שקיות</span>
                <span className="month-mini-value v-amber">
                  {m.bags.toLocaleString('he-IL')}
                </span>
              </div>
              <div className="month-mini-item">
                <span className="month-mini-label">הזמנות</span>
                <span className="month-mini-value v-violet">{m.orders.length}</span>
              </div>
            </div>

            {/* Orders table */}
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>לקוח</th>
                    <th>סוג אירוע</th>
                    <th>שקיות</th>
                    <th>מחיר חבילה</th>
                    <th>תוספות</th>
                    <th>הכנסה</th>
                    <th>עלות ייצור</th>
                    <th>רווח</th>
                    <th>סטטוס</th>
                  </tr>
                </thead>
                <tbody>
                  {m.orders
                    .sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate))
                    .map((o) => {
                      const rev =
                        (Number(o.packagePrice) || 0) + (Number(o.extras) || 0)
                      const profit = rev - (Number(o.productionCost) || 0)
                      return (
                        <tr key={o.id}>
                          <td className="td-bold">{o.customerName}</td>
                          <td style={{ color: 'var(--gray-500)', fontSize: 12 }}>
                            {o.eventType || '—'}
                          </td>
                          <td className="td-center" style={{ fontWeight: 600 }}>
                            {o.bagCount}
                          </td>
                          <td>{fmt(o.packagePrice)}</td>
                          <td style={{ color: o.extras > 0 ? 'inherit' : 'var(--gray-400)' }}>
                            {o.extras > 0 ? fmt(o.extras) : '—'}
                          </td>
                          <td className="td-revenue">{fmt(rev)}</td>
                          <td style={{ color: 'var(--gray-500)' }}>
                            {fmt(o.productionCost)}
                          </td>
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
                {/* Month subtotal row */}
                <tfoot>
                  <tr style={{ background: 'var(--gray-50)' }}>
                    <td
                      colSpan={5}
                      style={{ fontWeight: 700, color: 'var(--gray-600)', fontSize: 12 }}
                    >
                      סה״כ חודש
                    </td>
                    <td className="td-revenue">{fmt(m.revenue)}</td>
                    <td />
                    <td className={m.profit >= 0 ? 'td-profit' : 'td-loss'}>
                      {fmt(m.profit)}
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default MonthlyStats
