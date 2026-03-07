import { useState } from 'react'

const MONTH_NAMES = [
  'ינואר','פברואר','מרץ','אפריל','מאי','יוני',
  'יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר',
]

const fmt = (amount) => `₪${Number(amount || 0).toLocaleString('he-IL')}`

function monthLabel(ym) {
  if (!ym) return '—'
  const [year, month] = ym.split('-')
  return `${MONTH_NAMES[parseInt(month, 10) - 1]} ${year}`
}

const currentYM = () => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

const EMPTY_RECURRING = { name: '', amount: '', startMonth: currentYM(), endMonth: '', category: '' }
const EMPTY_ONETIME = { name: '', amount: '', month: currentYM(), category: '' }

const CATEGORIES = ['שיווק / פרסום', 'שכירות / אחסון', 'עמלות (Stripe, פייפאל)', 'ציוד', 'הוצאות משרד', 'אחר']

function RecurringForm({ onAdd, onCancel }) {
  const [form, setForm] = useState({ ...EMPTY_RECURRING })
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) { alert('נא להזין שם הוצאה'); return }
    if (!form.amount || Number(form.amount) <= 0) { alert('נא להזין סכום תקין'); return }
    if (!form.startMonth) { alert('נא להזין חודש התחלה'); return }
    onAdd({
      id: `exp_${Date.now()}`,
      name: form.name.trim(),
      amount: Number(form.amount),
      isRecurring: true,
      startMonth: form.startMonth,
      endMonth: form.endMonth || null,
      month: null,
      category: form.category,
      createdAt: new Date().toISOString(),
    })
  }

  return (
    <form className="expense-inline-form" onSubmit={handleSubmit}>
      <div className="expense-form-row">
        <div className="expense-form-group">
          <label className="expense-form-label">שם ההוצאה *</label>
          <input
            className="expense-form-input"
            type="text"
            placeholder="לדוגמה: שיווק פייסבוק"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            autoFocus
          />
        </div>
        <div className="expense-form-group expense-form-group--sm">
          <label className="expense-form-label">סכום (₪) *</label>
          <input
            className="expense-form-input"
            type="number"
            min="1"
            step="1"
            placeholder="0"
            value={form.amount}
            onChange={(e) => set('amount', e.target.value)}
            dir="ltr"
            style={{ textAlign: 'right' }}
          />
        </div>
        <div className="expense-form-group expense-form-group--sm">
          <label className="expense-form-label">מ-חודש *</label>
          <input
            className="expense-form-input"
            type="month"
            value={form.startMonth}
            onChange={(e) => set('startMonth', e.target.value)}
          />
        </div>
        <div className="expense-form-group expense-form-group--sm">
          <label className="expense-form-label">עד חודש (ריק = ללא הגבלה)</label>
          <input
            className="expense-form-input"
            type="month"
            value={form.endMonth}
            onChange={(e) => set('endMonth', e.target.value)}
          />
        </div>
        <div className="expense-form-group">
          <label className="expense-form-label">קטגוריה</label>
          <select
            className="expense-form-input"
            value={form.category}
            onChange={(e) => set('category', e.target.value)}
          >
            <option value="">— בחר —</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div className="expense-form-actions">
        <button type="submit" className="btn btn-violet btn-sm">✅ הוסף הוצאה חוזרת</button>
        <button type="button" className="btn btn-outline btn-sm" onClick={onCancel}>ביטול</button>
      </div>
    </form>
  )
}

function OnetimeForm({ onAdd, onCancel }) {
  const [form, setForm] = useState({ ...EMPTY_ONETIME })
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) { alert('נא להזין שם הוצאה'); return }
    if (!form.amount || Number(form.amount) <= 0) { alert('נא להזין סכום תקין'); return }
    if (!form.month) { alert('נא לבחור חודש'); return }
    onAdd({
      id: `exp_${Date.now()}`,
      name: form.name.trim(),
      amount: Number(form.amount),
      isRecurring: false,
      startMonth: null,
      endMonth: null,
      month: form.month,
      category: form.category,
      createdAt: new Date().toISOString(),
    })
  }

  return (
    <form className="expense-inline-form" onSubmit={handleSubmit}>
      <div className="expense-form-row">
        <div className="expense-form-group">
          <label className="expense-form-label">שם ההוצאה *</label>
          <input
            className="expense-form-input"
            type="text"
            placeholder="לדוגמה: קמפיין ממומן מרץ"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            autoFocus
          />
        </div>
        <div className="expense-form-group expense-form-group--sm">
          <label className="expense-form-label">סכום (₪) *</label>
          <input
            className="expense-form-input"
            type="number"
            min="1"
            step="1"
            placeholder="0"
            value={form.amount}
            onChange={(e) => set('amount', e.target.value)}
            dir="ltr"
            style={{ textAlign: 'right' }}
          />
        </div>
        <div className="expense-form-group expense-form-group--sm">
          <label className="expense-form-label">חודש *</label>
          <input
            className="expense-form-input"
            type="month"
            value={form.month}
            onChange={(e) => set('month', e.target.value)}
          />
        </div>
        <div className="expense-form-group">
          <label className="expense-form-label">קטגוריה</label>
          <select
            className="expense-form-input"
            value={form.category}
            onChange={(e) => set('category', e.target.value)}
          >
            <option value="">— בחר —</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div className="expense-form-actions">
        <button type="submit" className="btn btn-cyan btn-sm">✅ הוסף הוצאה חד-פעמית</button>
        <button type="button" className="btn btn-outline btn-sm" onClick={onCancel}>ביטול</button>
      </div>
    </form>
  )
}

function FixedExpenses({ fixedExpenses, setFixedExpenses }) {
  const [showRecurringForm, setShowRecurringForm] = useState(false)
  const [showOnetimeForm, setShowOnetimeForm] = useState(false)

  const recurring = fixedExpenses.filter((e) => e.isRecurring)
  const onetime = fixedExpenses.filter((e) => !e.isRecurring)

  const totalMonthlyRecurring = recurring
    .filter((e) => !e.endMonth || e.endMonth >= currentYM())
    .reduce((s, e) => s + e.amount, 0)

  const handleAdd = (expense) => {
    setFixedExpenses((prev) => [...prev, expense])
    setShowRecurringForm(false)
    setShowOnetimeForm(false)
  }

  const handleDelete = (id, label) => {
    if (window.confirm(`האם למחוק את ההוצאה "${label}"?`)) {
      setFixedExpenses((prev) => prev.filter((e) => e.id !== id))
    }
  }

  return (
    <div className="expenses-page">
      {/* Summary bar */}
      <div className="expenses-summary-bar">
        <div className="expense-summary-item">
          <span className="expense-summary-icon">🔄</span>
          <div>
            <div className="expense-summary-value">{recurring.length}</div>
            <div className="expense-summary-label">הוצאות חוזרות פעילות</div>
          </div>
        </div>
        <div className="expense-summary-item">
          <span className="expense-summary-icon">💸</span>
          <div>
            <div className="expense-summary-value v-red">{fmt(totalMonthlyRecurring)}</div>
            <div className="expense-summary-label">סה״כ חוזרות לחודש (כרגע)</div>
          </div>
        </div>
        <div className="expense-summary-item">
          <span className="expense-summary-icon">1️⃣</span>
          <div>
            <div className="expense-summary-value">{onetime.length}</div>
            <div className="expense-summary-label">הוצאות חד-פעמיות</div>
          </div>
        </div>
      </div>

      {/* ── Section 1: Recurring ── */}
      <div className="expense-section">
        <div className="expense-section-header">
          <div>
            <h2 className="expense-section-title">🔄 הוצאות קבועות חוזרות</h2>
            <p className="expense-section-desc">
              מתווספות <strong>אוטומטית לכל חודש</strong> בסיכום החודשי, בהתאם לטווח שהוגדר
            </p>
          </div>
          {!showRecurringForm && (
            <button
              className="btn btn-violet btn-sm"
              onClick={() => setShowRecurringForm(true)}
            >
              + הוסף הוצאה חוזרת
            </button>
          )}
        </div>

        {showRecurringForm && (
          <RecurringForm
            onAdd={handleAdd}
            onCancel={() => setShowRecurringForm(false)}
          />
        )}

        {recurring.length === 0 && !showRecurringForm ? (
          <div className="expense-empty">
            <div className="expense-empty-icon">🔄</div>
            <p>אין הוצאות חוזרות עדיין</p>
            <p style={{ fontSize: 12, opacity: 0.7 }}>לדוגמה: שכירות, Stripe, שיווק חודשי</p>
          </div>
        ) : (
          <div className="table-scroll">
            <table className="expense-table">
              <thead>
                <tr>
                  <th>שם ההוצאה</th>
                  <th>סכום חודשי</th>
                  <th>קטגוריה</th>
                  <th>מ-חודש</th>
                  <th>עד חודש</th>
                  <th>סטטוס</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {recurring.map((e) => {
                  const isActive = !e.endMonth || e.endMonth >= currentYM()
                  return (
                    <tr key={e.id}>
                      <td className="td-bold">{e.name}</td>
                      <td className="td-expense">{fmt(e.amount)}</td>
                      <td style={{ color: 'var(--gray-500)', fontSize: 12 }}>{e.category || '—'}</td>
                      <td style={{ fontSize: 13 }}>{monthLabel(e.startMonth)}</td>
                      <td style={{ fontSize: 13 }}>
                        {e.endMonth ? monthLabel(e.endMonth) : (
                          <span style={{ color: 'var(--green)', fontSize: 12 }}>ללא הגבלה</span>
                        )}
                      </td>
                      <td>
                        <span className={isActive ? 'badge badge-active' : 'badge badge-closed'}>
                          {isActive ? '✅ פעיל' : '⏹ הסתיים'}
                        </span>
                      </td>
                      <td>
                        <button
                          className="expense-delete-btn"
                          onClick={() => handleDelete(e.id, e.name)}
                          title="מחק"
                        >
                          🗑
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              {recurring.length > 0 && (
                <tfoot>
                  <tr>
                    <td style={{ fontWeight: 700, fontSize: 12, color: 'var(--gray-600)' }}>
                      סה״כ פעיל לחודש
                    </td>
                    <td className="td-expense" style={{ fontWeight: 800 }}>
                      {fmt(totalMonthlyRecurring)}
                    </td>
                    <td colSpan={5} />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}
      </div>

      {/* ── Section 2: One-time ── */}
      <div className="expense-section">
        <div className="expense-section-header">
          <div>
            <h2 className="expense-section-title">1️⃣ הוצאות חד-פעמיות</h2>
            <p className="expense-section-desc">
              הוצאה שמשויכת ל<strong>חודש ספציפי בלבד</strong> בסיכום החודשי
            </p>
          </div>
          {!showOnetimeForm && (
            <button
              className="btn btn-cyan btn-sm"
              onClick={() => setShowOnetimeForm(true)}
            >
              + הוסף הוצאה חד-פעמית
            </button>
          )}
        </div>

        {showOnetimeForm && (
          <OnetimeForm
            onAdd={handleAdd}
            onCancel={() => setShowOnetimeForm(false)}
          />
        )}

        {onetime.length === 0 && !showOnetimeForm ? (
          <div className="expense-empty">
            <div className="expense-empty-icon">1️⃣</div>
            <p>אין הוצאות חד-פעמיות עדיין</p>
            <p style={{ fontSize: 12, opacity: 0.7 }}>לדוגמה: קמפיין פרסום חד-פעמי, ציוד</p>
          </div>
        ) : (
          <div className="table-scroll">
            <table className="expense-table">
              <thead>
                <tr>
                  <th>שם ההוצאה</th>
                  <th>סכום</th>
                  <th>קטגוריה</th>
                  <th>חודש</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {onetime
                  .sort((a, b) => (b.month || '').localeCompare(a.month || ''))
                  .map((e) => (
                    <tr key={e.id}>
                      <td className="td-bold">{e.name}</td>
                      <td className="td-expense">{fmt(e.amount)}</td>
                      <td style={{ color: 'var(--gray-500)', fontSize: 12 }}>{e.category || '—'}</td>
                      <td style={{ fontSize: 13 }}>{monthLabel(e.month)}</td>
                      <td>
                        <button
                          className="expense-delete-btn"
                          onClick={() => handleDelete(e.id, e.name)}
                          title="מחק"
                        >
                          🗑
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default FixedExpenses
