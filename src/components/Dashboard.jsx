const PROJECT_STATUSES = ['ייזום', 'תכנון', 'היתרים', 'בנייה', 'סיום']

function getTenantStats(tenants) {
  return {
    signed: tenants.filter(t => t.agreementStatus === 'חתם').length,
    negotiating: tenants.filter(t => t.agreementStatus === 'במו"מ').length,
    waiting: tenants.filter(t => t.agreementStatus === 'ממתין').length,
    refused: tenants.filter(t => t.agreementStatus === 'סירב').length,
    total: tenants.length
  }
}

function getTaskDueInfo(dueDate) {
  if (!dueDate) return { label: '', cls: 'normal' }
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dueDate)
  const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24))
  if (diff < 0) return { label: `איחור ${Math.abs(diff)}י`, cls: 'overdue' }
  if (diff === 0) return { label: 'היום!', cls: 'overdue' }
  if (diff <= 7) return { label: `${diff} ימים`, cls: 'soon' }
  return { label: due.toLocaleDateString('he-IL', { day: 'numeric', month: 'short' }), cls: 'normal' }
}

function statusBadge(status) {
  const map = {
    'ייזום': 'badge-gray', 'תכנון': 'badge-blue',
    'היתרים': 'badge-amber', 'בנייה': 'badge-orange', 'סיום': 'badge-green'
  }
  return map[status] || 'badge-gray'
}

export default function Dashboard({ data, onProjectClick, onAddProject }) {
  const { projects, tenants, tasks } = data

  const activeProjects = projects.filter(p => p.status !== 'סיום')
  const signedTenants = tenants.filter(t => t.agreementStatus === 'חתם').length
  const openTasks = tasks.filter(t => t.status !== 'הושלם')
  const urgentTasks = openTasks.filter(t => t.priority === 'דחוף')

  const upcomingTasks = [...tasks]
    .filter(t => t.status !== 'הושלם' && t.dueDate)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 7)

  return (
    <div>
      {/* KPIs */}
      <div className="kpi-grid">
        {[
          { icon: '🏗️', value: projects.length, label: 'סה"כ פרויקטים', color: '#1d4ed8' },
          { icon: '⚡', value: activeProjects.length, label: 'פרויקטים פעילים', color: '#059669' },
          { icon: '👥', value: tenants.length, label: 'סה"כ דיירים', color: '#7c3aed' },
          {
            icon: '✅',
            value: tenants.length > 0 ? Math.round(signedTenants / tenants.length * 100) + '%' : '0%',
            label: 'הסכמת דיירים',
            color: '#059669'
          },
          { icon: '📋', value: openTasks.length, label: 'משימות פתוחות', color: '#d97706' },
          { icon: '🚨', value: urgentTasks.length, label: 'משימות דחופות', color: '#dc2626' },
        ].map(kpi => (
          <div key={kpi.label} className="kpi-card" style={{ borderTop: `3px solid ${kpi.color}` }}>
            <div className="kpi-icon">{kpi.icon}</div>
            <div className="kpi-value" style={{ color: kpi.color }}>{kpi.value}</div>
            <div className="kpi-label">{kpi.label}</div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        {/* Status Breakdown */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">📊 פרויקטים לפי שלב</h3>
          </div>
          <div className="card-body">
            {projects.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🏗️</div>
                <div className="empty-state-title">אין פרויקטים עדיין</div>
                <button className="btn-primary" onClick={onAddProject} style={{ marginTop: '0.75rem' }}>
                  + הוסף פרויקט ראשון
                </button>
              </div>
            ) : (
              PROJECT_STATUSES.map(status => {
                const count = projects.filter(p => p.status === status).length
                return (
                  <div key={status} style={{ marginBottom: '0.875rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                      <span className={`badge ${statusBadge(status)}`}>{status}</span>
                      <span className="text-sm font-bold">{count} פרויקטים</span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: projects.length > 0 ? `${(count / projects.length) * 100}%` : '0%',
                          background: count > 0 ? 'var(--primary-mid)' : 'transparent'
                        }}
                      />
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Tenant Agreement Summary */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">👥 הסכמות דיירים</h3>
          </div>
          <div className="card-body">
            {projects.filter(p => tenants.some(t => t.projectId === p.id)).length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-desc">אין נתוני דיירים עדיין</div>
              </div>
            ) : (
              projects.map(project => {
                const pt = tenants.filter(t => t.projectId === project.id)
                if (pt.length === 0) return null
                const stats = getTenantStats(pt)
                return (
                  <div
                    key={project.id}
                    style={{ marginBottom: '1rem', cursor: 'pointer' }}
                    onClick={() => onProjectClick(project.id)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                      <span className="text-sm font-bold">{project.name}</span>
                      <span className="text-xs" style={{ color: 'var(--gray-500)' }}>
                        {stats.signed}/{stats.total} חתמו
                      </span>
                    </div>
                    <div className="agreement-bar-track">
                      <div className="agreement-bar-fill" style={{ width: `${(stats.signed / stats.total) * 100}%`, background: 'var(--green)' }} />
                      <div className="agreement-bar-fill" style={{ width: `${(stats.negotiating / stats.total) * 100}%`, background: 'var(--amber)' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
                      <span className="text-xs" style={{ color: 'var(--green)' }}>✓ {stats.signed} חתמו</span>
                      <span className="text-xs" style={{ color: 'var(--amber)' }}>⟳ {stats.negotiating} מו"מ</span>
                      <span className="text-xs" style={{ color: 'var(--gray-400)' }}>○ {stats.waiting} ממתין</span>
                      {stats.refused > 0 && <span className="text-xs" style={{ color: 'var(--red)' }}>✗ {stats.refused} סירב</span>}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="card dashboard-grid-full">
          <div className="card-header">
            <h3 className="card-title">📅 משימות קרובות</h3>
            <span className="badge badge-amber">{openTasks.length} פתוחות</span>
          </div>
          <div className="card-body">
            {upcomingTasks.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">✅</div>
                <div className="empty-state-title">אין משימות פתוחות</div>
              </div>
            ) : (
              <div className="task-list">
                {upcomingTasks.map(task => {
                  const project = projects.find(p => p.id === task.projectId)
                  const due = getTaskDueInfo(task.dueDate)
                  return (
                    <div key={task.id} className="task-item" onClick={() => onProjectClick(task.projectId)}>
                      <span className={`priority-dot ${task.priority}`} />
                      <div className="task-item-main">
                        <div className="task-item-title">{task.title}</div>
                        <div className="task-item-meta">
                          {project?.name}&nbsp;·&nbsp;{task.category}
                        </div>
                      </div>
                      <span className={`badge ${task.priority === 'דחוף' ? 'badge-red' : task.priority === 'גבוה' ? 'badge-orange' : 'badge-gray'}`}>
                        {task.priority}
                      </span>
                      <div className={`task-item-due ${due.cls}`}>{due.label}</div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Active Projects Table */}
        <div className="card dashboard-grid-full">
          <div className="card-header">
            <h3 className="card-title">🏗️ פרויקטים פעילים</h3>
            <button className="btn-secondary" onClick={onAddProject}>+ פרויקט חדש</button>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {activeProjects.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🏗️</div>
                <div className="empty-state-title">אין פרויקטים פעילים</div>
                <button className="btn-primary" onClick={onAddProject} style={{ marginTop: '0.75rem' }}>
                  + פרויקט חדש
                </button>
              </div>
            ) : (
              <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
                <table>
                  <thead>
                    <tr>
                      <th>שם פרויקט</th>
                      <th>כתובת</th>
                      <th>סוג</th>
                      <th>שלב</th>
                      <th>דיירים (חתמו)</th>
                      <th>משימות פתוחות</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeProjects.map(project => {
                      const pt = tenants.filter(t => t.projectId === project.id)
                      const signed = pt.filter(t => t.agreementStatus === 'חתם').length
                      const openT = tasks.filter(t => t.projectId === project.id && t.status !== 'הושלם').length
                      return (
                        <tr key={project.id} style={{ cursor: 'pointer' }} onClick={() => onProjectClick(project.id)}>
                          <td><span className="font-bold">{project.name}</span></td>
                          <td className="text-muted">{project.address}{project.city ? `, ${project.city}` : ''}</td>
                          <td><span className="badge badge-blue">{project.type}</span></td>
                          <td><span className={`badge ${statusBadge(project.status)}`}>{project.status}</span></td>
                          <td>
                            {pt.length > 0
                              ? <span>{signed}/{pt.length}</span>
                              : <span className="text-muted">—</span>
                            }
                          </td>
                          <td>
                            <span className={`badge ${openT > 0 ? 'badge-amber' : 'badge-green'}`}>{openT}</span>
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
    </div>
  )
}
