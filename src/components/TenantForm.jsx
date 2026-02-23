import { useState } from 'react'

const AGREEMENT_STATUSES = ['ממתין', 'במו"מ', 'חתם', 'סירב']

const EMPTY = {
  name: '', phone: '', email: '', apartment: '', floor: '',
  agreementStatus: 'ממתין', signedDate: '', notes: ''
}

export default function TenantForm({ tenant, projectId, onSave, onClose }) {
  const [form, setForm] = useState(tenant ? { ...tenant } : { ...EMPTY })
  const [errors, setErrors] = useState({})

  const set = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'שדה חובה'
    return e
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    onSave({ ...form, name: form.name.trim(), projectId })
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{tenant ? '✏️ עריכת דייר' : '👤 דייר חדש'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <p className="form-section-title" style={{ marginTop: 0 }}>פרטי דייר</p>
            <div className="form-group">
              <label>שם מלא <span className="required">*</span></label>
              <input
                type="text"
                value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder="שם ומשפחה"
              />
              {errors.name && <span style={{ color: 'var(--red)', fontSize: '0.75rem' }}>{errors.name}</span>}
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>טלפון</label>
                <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="050-0000000" />
              </div>
              <div className="form-group">
                <label>אימייל</label>
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="mail@example.com" />
              </div>
            </div>

            <p className="form-section-title">פרטי דירה</p>
            <div className="form-row">
              <div className="form-group">
                <label>מספר דירה</label>
                <input type="text" value={form.apartment} onChange={e => set('apartment', e.target.value)} placeholder="3א" />
              </div>
              <div className="form-group">
                <label>קומה</label>
                <input type="text" value={form.floor} onChange={e => set('floor', e.target.value)} placeholder="1" />
              </div>
            </div>

            <p className="form-section-title">סטטוס הסכם</p>
            <div className="form-row">
              <div className="form-group">
                <label>סטטוס</label>
                <select value={form.agreementStatus} onChange={e => set('agreementStatus', e.target.value)}>
                  {AGREEMENT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>תאריך חתימה</label>
                <input
                  type="date"
                  value={form.signedDate}
                  onChange={e => set('signedDate', e.target.value)}
                  disabled={form.agreementStatus !== 'חתם'}
                />
              </div>
            </div>

            <div className="form-group">
              <label>הערות</label>
              <textarea
                value={form.notes}
                onChange={e => set('notes', e.target.value)}
                placeholder="הערות רלוונטיות לגבי הדייר..."
                rows={3}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="submit" className="btn-primary" style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '0.6rem 1.5rem' }}>
              {tenant ? '💾 שמור שינויים' : '+ הוסף דייר'}
            </button>
            <button type="button" className="btn-secondary" onClick={onClose}>ביטול</button>
          </div>
        </form>
      </div>
    </div>
  )
}
