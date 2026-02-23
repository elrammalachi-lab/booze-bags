import { useState } from 'react'

const STATUS_ORDER = ['ייזום', 'תכנון', 'היתרים', 'בנייה', 'סיום']

function statusBadge(status) {
  const map = {
    'ייזום': 'badge-gray', 'תכנון': 'badge-blue',
    'היתרים': 'badge-amber', 'בנייה': 'badge-orange', 'סיום': 'badge-green'
  }
  return map[status] || 'badge-gray'
}

function typeBadge(type) {
  const map = {
    'תמ"א 38/1': 'badge-cyan',
    'תמ"א 38/2': 'badge-purple',
    'פינוי-בינוי': 'badge-red',
    'עיבוי בינוי': 'badge-blue',
    'אחר': 'badge-gray'
  }
  return map[type] || 'badge-gray'
}

export default function ProjectsList({
  projects, tenants, tasks,
  onProjectClick, onEditProject, onDeleteProject, onAddProject
}) {
  const [filterStatus, setFilterStatus] = useState('')
  const [filterType, setFilterType] = useState('')
  const [search, setSearch] = useState('')

  const filtered = projects.filter(p => {
    if (filterStatus && p.status !== filterStatus) return false
    if (filterType && p.type !== filterType) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        p.name?.toLowerCase().includes(q) ||
        p.address?.toLowerCase().includes(q) ||
        p.city?.toLowerCase().includes(q) ||
        p.developer?.toLowerCase().includes(q)
      )
    }
    return true
  })

  const handleDelete = (e, projectId, projectName) => {
    e.stopPropagation()
    if (window.confirm(`למחוק את הפרויקט "${projectName}"?\nכל הדיירים והמשימות של פרויקט זה יימחקו גם כן.`)) {
      onDeleteProject(projectId)
    }
  }

  const handleEdit = (e, project) => {
    e.stopPropagation()
    onEditProject(project)
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">פרויקטים</h2>
          <p className="page-subtitle">{projects.length} פרויקטים בסה"כ</p>
        </div>
        <button className="btn-primary" style={{ background: 'var(--primary)', color: 'white' }} onClick={onAddProject}>
          + פרויקט חדש
        </button>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div className="card-body" style={{ padding: '0.875rem 1.25rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="🔍 חיפוש פרויקט..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ flex: '1', minWidth: '180px' }}
            />
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ minWidth: '130px' }}>
              <option value="">כל השלבים</option>
              {STATUS_ORDER.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={filterType} onChange={e => setFilterType(e.target.value)} style={{ minWidth: '150px' }}>
              <option value="">כל הסוגים</option>
              {['תמ"א 38/1', 'תמ"א 38/2', 'פינוי-בינוי', 'עיבוי בינוי', 'אחר'].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            {(filterStatus || filterType || search) && (
              <button
                className="btn-secondary"
                onClick={() => { setFilterStatus(''); setFilterType(''); setSearch('') }}
              >
                נקה סינון
              </button>
            )}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card">
          <div className="card-body">
            <div className="empty-state">
              <div className="empty-state-icon">🏗️</div>
              <div className="empty-state-title">
                {projects.length === 0 ? 'אין פרויקטים עדיין' : 'לא נמצאו פרויקטים'}
              </div>
              <div className="empty-state-desc">
                {projects.length === 0 ? 'התחל בהוספת הפרויקט הראשון שלך' : 'נסה לשנות את הסינון'}
              </div>
              {projects.length === 0 && (
                <button className="btn-primary" onClick={onAddProject} style={{ marginTop: '0.75rem', background: 'var(--primary)', color: 'white' }}>
                  + פרויקט חדש
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="projects-grid">
          {filtered.map(project => {
            const pt = tenants.filter(t => t.projectId === project.id)
            const signed = pt.filter(t => t.agreementStatus === 'חתם').length
            const openTasks = tasks.filter(t => t.projectId === project.id && t.status !== 'הושלם').length
            const urgentTasks = tasks.filter(t => t.projectId === project.id && t.priority === 'דחוף' && t.status !== 'הושלם').length

            return (
              <div key={project.id} className="project-card" onClick={() => onProjectClick(project.id)}>
                <div className="project-card-header">
                  <div>
                    <div className="project-card-name">{project.name}</div>
                    <div className="project-card-address">
                      📍 {project.address}{project.city ? `, ${project.city}` : ''}
                    </div>
                  </div>
                  <span className={`badge ${statusBadge(project.status)}`}>{project.status}</span>
                </div>

                <div className="project-card-body">
                  <div className="project-card-meta">
                    <span className={`badge ${typeBadge(project.type)}`}>{project.type}</span>
                    {project.developer && (
                      <span className="badge badge-gray">🏢 {project.developer}</span>
                    )}
                    {urgentTasks > 0 && (
                      <span className="badge badge-red">🚨 {urgentTasks} דחוף</span>
                    )}
                  </div>

                  <div className="project-card-stats">
                    <div className="project-stat">
                      <div className="project-stat-value">{project.totalUnits || '—'}</div>
                      <div className="project-stat-label">יח"ד קיימות</div>
                    </div>
                    <div className="project-stat">
                      <div className="project-stat-value">
                        {pt.length > 0 ? `${signed}/${pt.length}` : '—'}
                      </div>
                      <div className="project-stat-label">דיירים חתמו</div>
                    </div>
                    <div className="project-stat">
                      <div className="project-stat-value" style={{ color: openTasks > 0 ? 'var(--amber)' : 'var(--green)' }}>
                        {openTasks}
                      </div>
                      <div className="project-stat-label">משימות פתוחות</div>
                    </div>
                  </div>
                </div>

                <div className="project-card-actions">
                  <button
                    className="btn-secondary"
                    style={{ flex: 1 }}
                    onClick={(e) => handleEdit(e, project)}
                  >
                    ✏️ עריכה
                  </button>
                  <button
                    className="btn-danger"
                    onClick={(e) => handleDelete(e, project.id, project.name)}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
