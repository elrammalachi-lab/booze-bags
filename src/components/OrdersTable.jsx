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

const MONTH_NAMES = [
  'ינואר','פברואר','מרץ','אפריל','מאי','יוני',
  'יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר',
]

function fmtMonthOption(ym) {
  const [year, month] = ym.split('-')
  return `${MONTH_NAMES[parseInt(month, 10) - 1]} ${year}`
}

function OrdersTable({ orders, allOrders, filters, onFilterChange, onEdit, onDelete, onAddNew }) {
  const monthOptions = useMemo(() => {
    const months = new Set()
    allOrders.forEach((o) => {
      if (o.eventDate) months.add(o.eventDate.substring(0, 7))
    })
    return [...months].sort().reverse()
  }, [allOrders])

  const totals = useMemo(() => {
    return orders.reduce(
      (acc, o) => {
        const rev = (Number(o.packagePrice) || 0) + (Number(o.extras) || 0)
        const profit = rev - (Number(o.productionCost) || 0)
        return {
          revenue: acc.revenue + rev,
          profit: acc.profit + profit,
          bags: acc.bags + (Number(o.bagCount) || 0),
        }
      },
      { revenue: 0, profit: 0, bags: 0 }
    )
  }, [orders])

  const hasFilters = filters.month || filters.status

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* ── Filters ── */}
      <div className="filters-bar">
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-600)' }}>סינון:</span>

        <span className="filter-label">חודש:</span>
        <select
          className="filter-select"
          value={filters.month}
          onChange={(e) => onFilterChange((p) => ({ ...p, month: e.target.value }))}
        >
          <option value="">כל החודשים</option>
          {monthOptions.map((ym) => (
            <option key={ym} value={ym}>
              {fmtMonthOption(ym)}
            </option>
          ))}
        </select>

        <div className="filter-divider" />

        <span className="filter-label">סטטוס:</span>
        <select
          className="filter-select"
          value={filters.status}
          onChange={(e) => onFilterChange((p) => ({ ...p, status: e.target.value }))}
        >
          <option value="">הכל</option>
          <option value="open">פתוחה</option>
          <option value="in-progress">בטיפול</option>
          <option value="closed">סגורה</option>
        </select>

        <span className="filter-count">{orders.length} הזמנות</span>

        {hasFilters && (
          <button className="btn-clear" onClick={() => onFilterChange({ month: '', status: '' })}>
            נקה סינון ✕
          </button>
        )}
      </div>

      {/* ── Summary Bar (when filtered) ── */}
      {orders.length > 0 && (
        <div
          style={{
            display: 'flex',
            gap: 24,
            background: 'white',
            borderRadius: 'var(--radius-lg)',
            padding: '12px 20px',
            boxShadow: 'var(--shadow)',
            fontSize: 13,
            flexWrap: 'wrap',
          }}
        >
          <span style={{ color: 'var(--gray-500)' }}>
            סיכום:{' '}
            <strong style={{ color: 'var(--cyan)' }}>הכנסה {fmt(totals.revenue)}</strong>
            {'  '}
            <strong style={{ color: 'var(--green)' }}>רווח {fmt(totals.profit)}</strong>
            {'  '}
            <strong style={{ color: 'var(--amber)' }}>
              {totals.bags.toLocaleString('he-IL')} שקיות
            </strong>
          </span>
        </div>
      )}

      {/* ── Table ── */}
      <div className="table-container">
        <div className="card-header">
          <h3 className="card-title">רשימת הזמנות</h3>
          <button className="btn btn-violet btn-sm" onClick={onAddNew}>
            + הזמנה חדשה
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <p className="empty-state-text">
              {hasFilters ? 'אין הזמנות התואמות את הסינון' : 'אין הזמנות עדיין'}
            </p>
            {!hasFilters && (
              <button className="btn btn-violet" onClick={onAddNew}>
                הוסף הזמנה ראשונה
              </button>
            )}
          </div>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>שם לקוח</th>
                  <th>טלפון</th>
                  <th>תאריך אירוע</th>
                  <th>סוג אירוע</th>
                  <th>כמות שקיות</th>
                  <th>מחיר חבילה</th>
                  <th>תוספות</th>
                  <th>הכנסה</th>
                  <th>עלות ייצור</th>
                  <th>רווח</th>
                  <th>סטטוס</th>
                  <th>הערות</th>
                  <th>פעולות</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const revenue =
                    (Number(order.packagePrice) || 0) + (Number(order.extras) || 0)
                  const profit = revenue - (Number(order.productionCost) || 0)
                  return (
                    <tr key={order.id}>
                      <td className="td-bold">{order.customerName}</td>
                      <td>
                        {order.phone ? (
                          <a className="phone-link" href={`tel:${order.phone}`}>
                            {order.phone}
                          </a>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td>{fmtDate(order.eventDate)}</td>
                      <td>{order.eventType || '—'}</td>
                      <td className="td-center" style={{ fontWeight: 600 }}>
                        {order.bagCount}
                      </td>
                      <td>{fmt(order.packagePrice)}</td>
                      <td style={{ color: order.extras > 0 ? 'inherit' : 'var(--gray-400)' }}>
                        {order.extras > 0 ? fmt(order.extras) : '—'}
                      </td>
                      <td className="td-revenue">{fmt(revenue)}</td>
                      <td style={{ color: 'var(--gray-500)' }}>
                        {fmt(order.productionCost)}
                      </td>
                      <td className={profit >= 0 ? 'td-profit' : 'td-loss'}>
                        {fmt(profit)}
                      </td>
                      <td>
                        <span className={statusBadgeClass(order.status)}>
                          {statusLabel(order.status)}
                        </span>
                      </td>
                      <td className="td-notes" title={order.notes || ''}>
                        {order.notes || '—'}
                      </td>
                      <td>
                        <div className="actions-cell">
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => onEdit(order)}
                            title="ערוך הזמנה"
                          >
                            ✏️
                          </button>
                          <button
                            className="btn btn-danger-ghost btn-sm"
                            onClick={() => onDelete(order.id)}
                            title="מחק הזמנה"
                          >
                            🗑️
                          </button>
                        </div>
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
  )
}

export default OrdersTable
