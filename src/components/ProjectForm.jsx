import { useState } from 'react'

const PROJECT_TYPES = ['תמ"א 38/1', 'תמ"א 38/2', 'פינוי-בינוי', 'עיבוי בינוי', 'אחר']
const PROJECT_STATUSES = ['ייזום', 'תכנון', 'היתרים', 'בנייה', 'סיום']

const EMPTY = {
  name: '', address: '', city: '', type: 'תמ"א 38/1', status: 'ייזום',
  startDate: '', expectedEndDate: '', totalUnits: '', newUnits: '',
  floors: '', developer: '', contractor: '', description: '', notes: ''
}

export default function ProjectForm({ project, onSave, onClose }) {
  const [form, setForm] = useState(project ? { ...project } : { ...EMPTY })
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
    onSave({ ...form, name: form.name.trim() })
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{project ? '✏️ עריכת פרויקט' : '🏗️ פרויקט חדש'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Basic Info */}
            <p className="form-section-title" style={{ marginTop: 0 }}>פרטים בסיסיים</p>
            <div className="form-group">
              <label>שם הפרויקט <span className="required">*</span></label>
              <input
                type="text"
                value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder='לדוג: רחוב הרצל 42 תל אביב'
              />
              {errors.name && <span style={{ color: 'var(--red)', fontSize: '0.75rem' }}>{errors.name}</span>}
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>כתובת</label>
                <input type="text" value={form.address} onChange={e => set('address', e.target.value)} placeholder="רחוב ומספר" />
              </div>
              <div className="form-group">
                <label>עיר</label>
                <input type="text" value={form.city} onChange={e => set('city', e.target.value)} placeholder="תל אביב" />
              </div>
            </div>

            {/* Type & Status */}
            <p className="form-section-title">סוג ושלב</p>
            <div className="form-row">
              <div className="form-group">
                <label>סוג פרויקט</label>
                <select value={form.type} onChange={e => set('type', e.target.value)}>
                  {PROJECT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>שלב נוכחי</label>
                <select value={form.status} onChange={e => set('status', e.target.value)}>
                  {PROJECT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {/* Dates */}
            <p className="form-section-title">לוח זמנים</p>
            <div className="form-row">
              <div className="form-group">
                <label>תאריך התחלה</label>
                <input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} />
              </div>
              <div className="form-group">
                <label>תאריך סיום משוער</label>
                <input type="date" value={form.expectedEndDate} onChange={e => set('expectedEndDate', e.target.value)} />
              </div>
            </div>

            {/* Building data */}
            <p className="form-section-title">נתוני בנייה</p>
            <div className="form-row">
              <div className="form-group">
                <label>יח"ד קיימות</label>
                <input type="number" value={form.totalUnits} onChange={e => set('totalUnits', e.target.value)} placeholder="0" min="0" />
              </div>
              <div className="form-group">
                <label>יח"ד חדשות</label>
                <input type="number" value={form.newUnits} onChange={e => set('newUnits', e.target.value)} placeholder="0" min="0" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>מספר קומות</label>
                <input type="number" value={form.floors} onChange={e => set('floors', e.target.value)} placeholder="0" min="0" />
              </div>
              <div className="form-group" />
            </div>

            {/* Parties */}
            <p className="form-section-title">גורמים</p>
            <div className="form-row">
              <div className="form-group">
                <label>יזם</label>
                <input type="text" value={form.developer} onChange={e => set('developer', e.target.value)} placeholder="שם חברת יזמות" />
              </div>
              <div className="form-group">
                <label>קבלן</label>
                <input type="text" value={form.contractor} onChange={e => set('contractor', e.target.value)} placeholder="שם חברת קבלנות" />
              </div>
            </div>

            {/* Description & Notes */}
            <p className="form-section-title">תיאור והערות</p>
            <div className="form-group">
              <label>תיאור קצר</label>
              <textarea
                value={form.description}
                onChange={e => set('description', e.target.value)}
                placeholder="תיאור כללי של הפרויקט..."
                rows={2}
              />
            </div>
            <div className="form-group">
              <label>הערות</label>
              <textarea
                value={form.notes}
                onChange={e => set('notes', e.target.value)}
                placeholder="הערות נוספות, מידע חשוב..."
                rows={3}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="submit" className="btn-primary" style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '0.6rem 1.5rem' }}>
              {project ? '💾 שמור שינויים' : '+ צור פרויקט'}
            </button>
            <button type="button" className="btn-secondary" onClick={onClose}>ביטול</button>
          </div>
        </form>
      </div>
    </div>
  )
}
