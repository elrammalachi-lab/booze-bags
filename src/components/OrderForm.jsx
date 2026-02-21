import { useState } from 'react'

const fmt = (n) => {
  const num = Number(n) || 0
  return num > 0 ? `₪${num.toLocaleString('he-IL')}` : '—'
}

const EVENT_TYPES = [
  'חתונה',
  'בר מצווה',
  'בת מצווה',
  'יום הולדת',
  'מסיבת קוקטייל',
  'אירוע חברה',
  'מסיבת רווקים/ות',
  'ברית',
  'אחר',
]

const BAG_COUNTS = [200, 300, 400, 500]

const EMPTY = {
  customerName: '',
  phone: '',
  eventDate: '',
  eventType: '',
  bagCount: 300,
  packagePrice: '',
  extras: '',
  productionCost: '',
  status: 'open',
  notes: '',
}

function OrderForm({ order, onSave, onClose }) {
  const [form, setForm] = useState(() =>
    order
      ? {
          customerName: order.customerName || '',
          phone: order.phone || '',
          eventDate: order.eventDate || '',
          eventType: order.eventType || '',
          bagCount: order.bagCount || 300,
          packagePrice: order.packagePrice === 0 ? 0 : order.packagePrice || '',
          extras: order.extras === 0 ? '' : order.extras || '',
          productionCost: order.productionCost === 0 ? 0 : order.productionCost || '',
          status: order.status || 'open',
          notes: order.notes || '',
        }
      : { ...EMPTY }
  )

  const set = (field, value) => setForm((p) => ({ ...p, [field]: value }))

  const revenue = (Number(form.packagePrice) || 0) + (Number(form.extras) || 0)
  const profit = revenue - (Number(form.productionCost) || 0)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.customerName.trim()) {
      alert('נא להזין שם לקוח')
      return
    }
    onSave({
      customerName: form.customerName.trim(),
      phone: form.phone.trim(),
      eventDate: form.eventDate,
      eventType: form.eventType,
      bagCount: Number(form.bagCount),
      packagePrice: Number(form.packagePrice) || 0,
      extras: Number(form.extras) || 0,
      productionCost: Number(form.productionCost) || 0,
      status: form.status,
      notes: form.notes.trim(),
    })
  }

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="modal">
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">
            {order ? '✏️  עריכת הזמנה' : '➕  הזמנה חדשה'}
          </h2>
          <button className="modal-close" onClick={onClose} aria-label="סגור">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              {/* Section: פרטי לקוח */}
              <div className="form-section-title">פרטי לקוח</div>

              <div className="form-group">
                <label className="form-label">שם לקוח *</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="שם מלא"
                  value={form.customerName}
                  onChange={(e) => set('customerName', e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label className="form-label">טלפון</label>
                <input
                  className="form-input"
                  type="tel"
                  placeholder="050-0000000"
                  value={form.phone}
                  onChange={(e) => set('phone', e.target.value)}
                  dir="ltr"
                  style={{ textAlign: 'right' }}
                />
              </div>

              {/* Section: פרטי אירוע */}
              <div className="form-section-title">פרטי האירוע</div>

              <div className="form-group">
                <label className="form-label">תאריך אירוע</label>
                <input
                  className="form-input"
                  type="date"
                  value={form.eventDate}
                  onChange={(e) => set('eventDate', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">סוג אירוע</label>
                <select
                  className="form-select"
                  value={form.eventType}
                  onChange={(e) => set('eventType', e.target.value)}
                >
                  <option value="">בחר סוג אירוע</option>
                  {EVENT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">כמות שקיות</label>
                <select
                  className="form-select"
                  value={form.bagCount}
                  onChange={(e) => set('bagCount', e.target.value)}
                >
                  {BAG_COUNTS.map((n) => (
                    <option key={n} value={n}>
                      {n} שקיות
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">סטטוס</label>
                <select
                  className="form-select"
                  value={form.status}
                  onChange={(e) => set('status', e.target.value)}
                >
                  <option value="open">🕐  פתוחה</option>
                  <option value="in-progress">⚙️  בטיפול</option>
                  <option value="closed">✅  סגורה</option>
                </select>
              </div>

              {/* Section: כספים */}
              <div className="form-section-title">כספים</div>

              <div className="form-group">
                <label className="form-label">מחיר חבילה (₪)</label>
                <input
                  className="form-input"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="0"
                  value={form.packagePrice}
                  onChange={(e) => set('packagePrice', e.target.value)}
                  dir="ltr"
                  style={{ textAlign: 'right' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">תוספות (₪)</label>
                <input
                  className="form-input"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="0"
                  value={form.extras}
                  onChange={(e) => set('extras', e.target.value)}
                  dir="ltr"
                  style={{ textAlign: 'right' }}
                />
                <span className="form-hint">תוספות מיוחדות, שדרוגים, כו׳</span>
              </div>

              <div className="form-group form-grid-full">
                <label className="form-label">עלות ייצור (₪)</label>
                <input
                  className="form-input"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="0"
                  value={form.productionCost}
                  onChange={(e) => set('productionCost', e.target.value)}
                  dir="ltr"
                  style={{ textAlign: 'right' }}
                />
                <span className="form-hint">עלות חומרים + הכנה</span>
              </div>

              {/* Notes */}
              <div className="form-group form-grid-full">
                <label className="form-label">הערות</label>
                <textarea
                  className="form-textarea"
                  placeholder="הערות, בקשות מיוחדות..."
                  value={form.notes}
                  onChange={(e) => set('notes', e.target.value)}
                />
              </div>
            </div>

            {/* ── Live Calculation Box ── */}
            <div className="calc-box">
              <div className="calc-item">
                <span className="calc-label">מחיר חבילה</span>
                <span className="calc-value" style={{ color: 'var(--gray-700)', fontSize: 17 }}>
                  {fmt(form.packagePrice)}
                </span>
              </div>
              <span className="calc-operator">+</span>
              <div className="calc-item">
                <span className="calc-label">תוספות</span>
                <span className="calc-value" style={{ color: 'var(--gray-700)', fontSize: 17 }}>
                  {fmt(form.extras)}
                </span>
              </div>
              <span className="calc-operator">=</span>
              <div className="calc-item">
                <span className="calc-label">הכנסה</span>
                <span className="calc-value revenue">{`₪${revenue.toLocaleString('he-IL')}`}</span>
              </div>
              <span className="calc-operator">−</span>
              <div className="calc-item">
                <span className="calc-label">עלות ייצור</span>
                <span className="calc-value" style={{ color: 'var(--gray-700)', fontSize: 17 }}>
                  {fmt(form.productionCost)}
                </span>
              </div>
              <span className="calc-operator">=</span>
              <div className="calc-item">
                <span className="calc-label">רווח</span>
                <span className={`calc-value ${profit >= 0 ? 'profit-pos' : 'profit-neg'}`}>
                  {`₪${profit.toLocaleString('he-IL')}`}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button type="submit" className="btn btn-violet">
              {order ? '💾  שמור שינויים' : '✅  הוסף הזמנה'}
            </button>
            <button type="button" className="btn btn-outline" onClick={onClose}>
              ביטול
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default OrderForm
