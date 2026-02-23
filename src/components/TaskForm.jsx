import { useState } from 'react'

const TASK_STATUSES = ['פתוח', 'בתהליך', 'הושלם']
const PRIORITIES = ['נמוך', 'בינוני', 'גבוה', 'דחוף']
const CATEGORIES = ['היתרים', 'דיירים', 'קבלנים', 'משפטי', 'תכנון', 'מימון', 'כללי']

const EMPTY = {
  title: '', description: '', dueDate: '',
  status: 'פתוח', priority: 'בינוני', category: 'כללי'
}

export default function TaskForm({ task, projectId, onSave, onClose }) {
  const [form, setForm] = useState(task ? { ...task } : { ...EMPTY })
  const [errors, setErrors] = useState({})

  const set = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.title.trim()) e.title = 'שדה חובה'
    return e
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    onSave({ ...form, title: form.title.trim(), projectId })
  }

  const priorityColors = {
    'נמוך': 'var(--gray-400)',
    'בינוני': 'var(--amber)',
    'גבוה': 'var(--orange)',
    'דחוף': 'var(--red)'
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{task ? '✏️ עריכת משימה' : '✅ משימה חדשה'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>כותרת המשימה <span className="required">*</span></label>
              <input
                type="text"
                value={form.title}
                onChange={e => set('title', e.target.value)}
                placeholder="תיאור קצר של המשימה"
              />
              {errors.title && <span style={{ color: 'var(--red)', fontSize: '0.75rem' }}>{errors.title}</span>}
            </div>

            <div className="form-group">
              <label>תיאור מפורט</label>
              <textarea
                value={form.description}
                onChange={e => set('description', e.target.value)}
                placeholder="פרטים נוספים על המשימה..."
                rows={3}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>קטגוריה</label>
                <select value={form.category} onChange={e => set('category', e.target.value)}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>תאריך יעד</label>
                <input type="date" value={form.dueDate} onChange={e => set('dueDate', e.target.value)} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>עדיפות</label>
                <select
                  value={form.priority}
                  onChange={e => set('priority', e.target.value)}
                  style={{ borderColor: priorityColors[form.priority], borderWidth: '2px' }}
                >
                  {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>סטטוס</label>
                <select value={form.status} onChange={e => set('status', e.target.value)}>
                  {TASK_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="submit" className="btn-primary" style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '0.6rem 1.5rem' }}>
              {task ? '💾 שמור שינויים' : '+ הוסף משימה'}
            </button>
            <button type="button" className="btn-secondary" onClick={onClose}>ביטול</button>
          </div>
        </form>
      </div>
    </div>
  )
}
