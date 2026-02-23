import { useState } from 'react'
import TenantForm from './TenantForm'
import TaskForm from './TaskForm'

const PROJECT_STATUSES = ['ייזום', 'תכנון', 'היתרים', 'בנייה', 'סיום']

function statusBadge(status) {
  const map = {
    'ייזום': 'badge-gray', 'תכנון': 'badge-blue',
    'היתרים': 'badge-amber', 'בנייה': 'badge-orange', 'סיום': 'badge-green'
  }
  return map[status] || 'badge-gray'
}

function agreementBadge(status) {
  const map = {
    'חתם': 'badge-green',
    'במו"מ': 'badge-amber',
    'ממתין': 'badge-gray',
    'סירב': 'badge-red'
  }
  return map[status] || 'badge-gray'
}

function taskStatusBadge(status) {
  const map = { 'הושלם': 'badge-green', 'בתהליך': 'badge-blue', 'פתוח': 'badge-gray' }
  return map[status] || 'badge-gray'
}

function priorityBadge(priority) {
  const map = { 'דחוף': 'badge-red', 'גבוה': 'badge-orange', 'בינוני': 'badge-amber', 'נמוך': 'badge-gray' }
  return map[priority] || 'badge-gray'
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' })
}

function getDaysUntil(dateStr) {
  if (!dateStr) return null
  const today = new Date(); today.setHours(0,0,0,0)
  const diff = Math.ceil((new Date(dateStr) - today) / (1000 * 60 * 60 * 24))
  return diff
}

export default function ProjectDetail({
  project, tenants, tasks,
  onBack, onEditProject, onDeleteProject,
  onUpdateTenants, onUpdateTasks
}) {
  const [activeTab, setActiveTab] = useState('info')
  const [showTenantForm, setShowTenantForm] = useState(false)
  const [editingTenant, setEditingTenant] = useState(null)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [taskFilter, setTaskFilter] = useState('')

  // --- Tenant handlers ---
  const handleSaveTenant = (tenantData) => {
    if (editingTenant) {
      onUpdateTenants(tenants.map(t => t.id === tenantData.id ? tenantData : t))
    } else {
      onUpdateTenants([...tenants, { ...tenantData, id: 'ten_' + Date.now(), projectId: project.id }])
    }
    setShowTenantForm(false)
    setEditingTenant(null)
  }

  const handleDeleteTenant = (tenantId) => {
    if (window.confirm('למחוק את הדייר?')) {
      onUpdateTenants(tenants.filter(t => t.id !== tenantId))
    }
  }

  // --- Task handlers ---
  const handleSaveTask = (taskData) => {
    if (editingTask) {
      onUpdateTasks(tasks.map(t => t.id === taskData.id ? taskData : t))
    } else {
      onUpdateTasks([...tasks, {
        ...taskData,
        id: 'task_' + Date.now(),
        projectId: project.id,
        createdAt: new Date().toISOString()
      }])
    }
    setShowTaskForm(false)
    setEditingTask(null)
  }

  const handleDeleteTask = (taskId) => {
    if (window.confirm('למחוק את המשימה?')) {
      onUpdateTasks(tasks.filter(t => t.id !== taskId))
    }
  }

  const handleToggleTaskStatus = (task) => {
    const next = task.status === 'הושלם' ? 'פתוח' :
                 task.status === 'פתוח' ? 'בתהליך' : 'הושלם'
    onUpdateTasks(tasks.map(t => t.id === task.id ? { ...t, status: next } : t))
  }

  const handleDeleteProject = () => {
    if (window.confirm(`למחוק את הפרויקט "${project.name}"?\nכל הדיירים והמשימות יימחקו גם כן.`)) {
      onDeleteProject(project.id)
    }
  }

  // Stats
  const signedTenants = tenants.filter(t => t.agreementStatus === 'חתם').length
  const openTasks = tasks.filter(t => t.status !== 'הושלם').length

  // Filtered tasks
  const filteredTasks = taskFilter
    ? tasks.filter(t => t.status === taskFilter)
    : tasks

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    const statusOrder = { 'בתהליך': 0, 'פתוח': 1, 'הושלם': 2 }
    const priorityOrder = { 'דחוף': 0, 'גבוה': 1, 'בינוני': 2, 'נמוך': 3 }
    if (statusOrder[a.status] !== statusOrder[b.status]) return statusOrder[a.status] - statusOrder[b.status]
    return priorityOrder[a.priority] - priorityOrder[b.priority]
  })

  // Status timeline index
  const statusIdx = PROJECT_STATUSES.indexOf(project.status)

  return (
    <div>
      {/* Back button */}
      <button className="back-btn" onClick={onBack}>
        ← חזרה לפרויקטים
      </button>

      {/* Project Header Card */}
      <div className="project-detail-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h2 className="project-detail-title">{project.name}</h2>
            <p className="project-detail-address">📍 {project.address}{project.city ? `, ${project.city}` : ''}</p>
            <div className="project-detail-meta">
              <span className={`badge ${statusBadge(project.status)}`}>{project.status}</span>
              <span className="badge badge-blue">{project.type}</span>
              {project.developer && <span className="badge badge-gray">🏢 {project.developer}</span>}
              {project.contractor && <span className="badge badge-gray">🔨 {project.contractor}</span>}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
            <button className="btn-secondary" onClick={() => onEditProject(project)}>✏️ עריכה</button>
            <button className="btn-danger" onClick={handleDeleteProject}>🗑️ מחיקה</button>
          </div>
        </div>

        {/* Status Timeline */}
        <div className="status-timeline" style={{ margin: '1.25rem 0 0.5rem' }}>
          {PROJECT_STATUSES.map((s, i) => (
            <>
              <div key={s} className="status-step">
                <div className={`status-step-dot ${i < statusIdx ? 'done' : i === statusIdx ? 'current' : ''}`}>
                  {i < statusIdx ? '✓' : i + 1}
                </div>
                <div className={`status-step-label ${i < statusIdx ? 'done' : i === statusIdx ? 'current' : ''}`}>{s}</div>
              </div>
              {i < PROJECT_STATUSES.length - 1 && (
                <div key={`conn-${i}`} className={`status-connector ${i < statusIdx ? 'done' : ''}`} />
              )}
            </>
          ))}
        </div>

        {/* Info Grid */}
        <div className="project-info-grid">
          <div className="project-info-item">
            <label>יח"ד קיימות</label>
            <span>{project.totalUnits || '—'}</span>
          </div>
          <div className="project-info-item">
            <label>יח"ד חדשות</label>
            <span>{project.newUnits || '—'}</span>
          </div>
          <div className="project-info-item">
            <label>קומות</label>
            <span>{project.floors || '—'}</span>
          </div>
          <div className="project-info-item">
            <label>תאריך התחלה</label>
            <span>{formatDate(project.startDate)}</span>
          </div>
          <div className="project-info-item">
            <label>תאריך סיום משוער</label>
            <span>
              {formatDate(project.expectedEndDate)}
              {project.expectedEndDate && (() => {
                const days = getDaysUntil(project.expectedEndDate)
                if (days === null) return null
                if (days < 0) return <span style={{ color: 'var(--red)', fontSize: '0.7rem', marginRight: '0.35rem' }}>(איחור {Math.abs(days)} יום)</span>
                if (days < 90) return <span style={{ color: 'var(--amber)', fontSize: '0.7rem', marginRight: '0.35rem' }}>({days} יום)</span>
                return null
              })()}
            </span>
          </div>
          <div className="project-info-item">
            <label>דיירים שחתמו</label>
            <span>{tenants.length > 0 ? `${signedTenants}/${tenants.length}` : '—'}</span>
          </div>
        </div>

        {project.description && (
          <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'var(--gray-50)', borderRadius: 'var(--radius)', fontSize: '0.875rem', color: 'var(--gray-700)' }}>
            {project.description}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`} onClick={() => setActiveTab('info')}>
          📋 מידע
        </button>
        <button className={`tab-btn ${activeTab === 'tenants' ? 'active' : ''}`} onClick={() => setActiveTab('tenants')}>
          👥 דיירים
          {tenants.length > 0 && <span className="tab-count">{tenants.length}</span>}
        </button>
        <button className={`tab-btn ${activeTab === 'tasks' ? 'active' : ''}`} onClick={() => setActiveTab('tasks')}>
          ✅ משימות
          {openTasks > 0 && <span className="tab-count">{openTasks}</span>}
        </button>
        <button className={`tab-btn ${activeTab === 'notes' ? 'active' : ''}`} onClick={() => setActiveTab('notes')}>
          📝 הערות
        </button>
      </div>

      {/* Tab: Info */}
      {activeTab === 'info' && (
        <div className="card">
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
              <div>
                <p className="form-section-title" style={{ marginTop: 0 }}>פרטי פרויקט</p>
                <InfoRow label="שם פרויקט" value={project.name} />
                <InfoRow label="כתובת" value={project.address} />
                <InfoRow label="עיר" value={project.city} />
                <InfoRow label="סוג פרויקט" value={project.type} />
                <InfoRow label="שלב נוכחי" value={project.status} />
              </div>
              <div>
                <p className="form-section-title" style={{ marginTop: 0 }}>נתוני בנייה</p>
                <InfoRow label='יח"ד קיימות' value={project.totalUnits} />
                <InfoRow label='יח"ד חדשות' value={project.newUnits} />
                <InfoRow label="מספר קומות" value={project.floors} />
                <InfoRow label="תאריך התחלה" value={formatDate(project.startDate)} />
                <InfoRow label="תאריך סיום משוער" value={formatDate(project.expectedEndDate)} />
              </div>
              <div>
                <p className="form-section-title" style={{ marginTop: 0 }}>גורמים</p>
                <InfoRow label="יזם" value={project.developer} />
                <InfoRow label="קבלן" value={project.contractor} />
              </div>
            </div>
            {project.description && (
              <>
                <p className="form-section-title">תיאור</p>
                <p style={{ fontSize: '0.875rem', color: 'var(--gray-700)' }}>{project.description}</p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Tab: Tenants */}
      {activeTab === 'tenants' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              {tenants.length > 0 && (
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {[
                    { label: 'חתמו', count: tenants.filter(t => t.agreementStatus === 'חתם').length, cls: 'badge-green' },
                    { label: 'מו"מ', count: tenants.filter(t => t.agreementStatus === 'במו"מ').length, cls: 'badge-amber' },
                    { label: 'ממתין', count: tenants.filter(t => t.agreementStatus === 'ממתין').length, cls: 'badge-gray' },
                    { label: 'סירב', count: tenants.filter(t => t.agreementStatus === 'סירב').length, cls: 'badge-red' },
                  ].map(s => s.count > 0 && (
                    <span key={s.label} className={`badge ${s.cls}`}>{s.label}: {s.count}</span>
                  ))}
                </div>
              )}
            </div>
            <button
              className="btn-secondary"
              onClick={() => { setEditingTenant(null); setShowTenantForm(true) }}
            >
              + הוסף דייר
            </button>
          </div>

          {tenants.length === 0 ? (
            <div className="card">
              <div className="card-body">
                <div className="empty-state">
                  <div className="empty-state-icon">👥</div>
                  <div className="empty-state-title">אין דיירים רשומים</div>
                  <div className="empty-state-desc">הוסף את הדיירים של הפרויקט</div>
                  <button className="btn-secondary" onClick={() => { setEditingTenant(null); setShowTenantForm(true) }} style={{ marginTop: '0.75rem' }}>
                    + הוסף דייר ראשון
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
                <table>
                  <thead>
                    <tr>
                      <th>שם</th>
                      <th>דירה / קומה</th>
                      <th>טלפון</th>
                      <th>אימייל</th>
                      <th>סטטוס הסכם</th>
                      <th>תאריך חתימה</th>
                      <th>הערות</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...tenants].sort((a, b) => {
                      const order = { 'חתם': 0, 'במו"מ': 1, 'ממתין': 2, 'סירב': 3 }
                      return (order[a.agreementStatus] ?? 9) - (order[b.agreementStatus] ?? 9)
                    }).map(tenant => (
                      <tr key={tenant.id}>
                        <td><span className="font-bold">{tenant.name}</span></td>
                        <td>{tenant.apartment || '—'}{tenant.floor ? ` / קומה ${tenant.floor}` : ''}</td>
                        <td>
                          {tenant.phone
                            ? <a href={`tel:${tenant.phone}`} style={{ color: 'var(--primary)', textDecoration: 'none' }} onClick={e => e.stopPropagation()}>{tenant.phone}</a>
                            : '—'
                          }
                        </td>
                        <td className="text-muted">{tenant.email || '—'}</td>
                        <td><span className={`badge ${agreementBadge(tenant.agreementStatus)}`}>{tenant.agreementStatus}</span></td>
                        <td className="text-muted">{formatDate(tenant.signedDate)}</td>
                        <td className="text-muted" style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {tenant.notes || '—'}
                        </td>
                        <td>
                          <div className="td-actions">
                            <button className="btn-icon" title="עריכה" onClick={() => { setEditingTenant(tenant); setShowTenantForm(true) }}>✏️</button>
                            <button className="btn-icon" title="מחיקה" onClick={() => handleDeleteTenant(tenant.id)}>🗑️</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Tasks */}
      {activeTab === 'tasks' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {['', 'פתוח', 'בתהליך', 'הושלם'].map(s => (
                <button
                  key={s}
                  className={taskFilter === s ? 'btn-primary' : 'btn-secondary'}
                  style={taskFilter === s ? { background: 'var(--primary)', color: 'white', border: 'none' } : {}}
                  onClick={() => setTaskFilter(s)}
                >
                  {s || 'הכל'}
                </button>
              ))}
            </div>
            <button className="btn-secondary" onClick={() => { setEditingTask(null); setShowTaskForm(true) }}>
              + משימה חדשה
            </button>
          </div>

          {sortedTasks.length === 0 ? (
            <div className="card">
              <div className="card-body">
                <div className="empty-state">
                  <div className="empty-state-icon">✅</div>
                  <div className="empty-state-title">
                    {tasks.length === 0 ? 'אין משימות' : 'אין משימות בסינון זה'}
                  </div>
                  {tasks.length === 0 && (
                    <button className="btn-secondary" onClick={() => { setEditingTask(null); setShowTaskForm(true) }} style={{ marginTop: '0.75rem' }}>
                      + הוסף משימה ראשונה
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
                <table>
                  <thead>
                    <tr>
                      <th>סטטוס</th>
                      <th>כותרת</th>
                      <th>קטגוריה</th>
                      <th>עדיפות</th>
                      <th>תאריך יעד</th>
                      <th>תיאור</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedTasks.map(task => {
                      const days = getDaysUntil(task.dueDate)
                      const isOverdue = task.status !== 'הושלם' && days !== null && days < 0
                      return (
                        <tr key={task.id} style={{ opacity: task.status === 'הושלם' ? 0.6 : 1 }}>
                          <td>
                            <button
                              onClick={() => handleToggleTaskStatus(task)}
                              className={`badge ${taskStatusBadge(task.status)}`}
                              style={{ cursor: 'pointer', border: 'none', font: 'inherit' }}
                              title="לחץ לשינוי סטטוס"
                            >
                              {task.status === 'הושלם' ? '✓ ' : task.status === 'בתהליך' ? '⟳ ' : '○ '}
                              {task.status}
                            </button>
                          </td>
                          <td>
                            <span className="font-bold" style={{ textDecoration: task.status === 'הושלם' ? 'line-through' : 'none' }}>
                              {task.title}
                            </span>
                          </td>
                          <td><span className="badge badge-gray">{task.category}</span></td>
                          <td><span className={`badge ${priorityBadge(task.priority)}`}><span className={`priority-dot ${task.priority}`} style={{ marginLeft: '0.3rem' }} />{task.priority}</span></td>
                          <td style={{ color: isOverdue ? 'var(--red)' : 'inherit', fontWeight: isOverdue ? 700 : 'normal' }}>
                            {task.dueDate ? (
                              <>
                                {new Date(task.dueDate).toLocaleDateString('he-IL')}
                                {isOverdue && <span style={{ fontSize: '0.7rem', display: 'block' }}>איחור!</span>}
                              </>
                            ) : '—'}
                          </td>
                          <td className="text-muted" style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {task.description || '—'}
                          </td>
                          <td>
                            <div className="td-actions">
                              <button className="btn-icon" onClick={() => { setEditingTask(task); setShowTaskForm(true) }}>✏️</button>
                              <button className="btn-icon" onClick={() => handleDeleteTask(task.id)}>🗑️</button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Notes */}
      {activeTab === 'notes' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">📝 הערות לפרויקט</h3>
            <button className="btn-secondary" onClick={() => onEditProject(project)}>✏️ עריכה</button>
          </div>
          <div className="card-body">
            {project.notes ? (
              <p style={{ fontSize: '0.9rem', lineHeight: 1.7, color: 'var(--gray-700)', whiteSpace: 'pre-wrap' }}>
                {project.notes}
              </p>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">📝</div>
                <div className="empty-state-title">אין הערות עדיין</div>
                <button className="btn-secondary" onClick={() => onEditProject(project)} style={{ marginTop: '0.5rem' }}>
                  ✏️ הוסף הערות
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tenant Form Modal */}
      {showTenantForm && (
        <TenantForm
          tenant={editingTenant}
          projectId={project.id}
          onSave={handleSaveTenant}
          onClose={() => { setShowTenantForm(false); setEditingTenant(null) }}
        />
      )}

      {/* Task Form Modal */}
      {showTaskForm && (
        <TaskForm
          task={editingTask}
          projectId={project.id}
          onSave={handleSaveTask}
          onClose={() => { setShowTaskForm(false); setEditingTask(null) }}
        />
      )}
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div style={{ marginBottom: '0.6rem' }}>
      <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)', display: 'block' }}>{label}</span>
      <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{value || '—'}</span>
    </div>
  )
}
